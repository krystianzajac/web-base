# web-base Implementation Guide

This guide walks through building a new web application from scratch using web-base packages. By the end you will have a fully working Next.js app with authentication, data fetching, CMS content, monitoring, and tests — all wired up to the shared Supabase backend.

Read this top to bottom the first time. Use it as a reference after that.

---

## Table of contents

1. [Create the Next.js project](#1-create-the-nextjs-project)
2. [Add web-base packages](#2-add-web-base-packages)
3. [Configure the brand](#3-configure-the-brand)
4. [Set up the provider stack](#4-set-up-the-provider-stack)
5. [Add authentication](#5-add-authentication)
6. [Protect routes with middleware](#6-protect-routes-with-middleware)
7. [Fetch data](#7-fetch-data)
8. [Add CMS content](#8-add-cms-content)
9. [Add monitoring](#9-add-monitoring)
10. [Write tests](#10-write-tests)
11. [Generate Supabase types](#11-generate-supabase-types)
12. [Checklist before shipping](#12-checklist-before-shipping)

---

## 1. Create the Next.js project

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd my-app
```

Delete the boilerplate content from `src/app/page.tsx` and `src/app/globals.css` — you will replace them.

---

## 2. Add web-base packages

Add only the packages your app needs. A read-only marketing site only needs `base_ui` and `base_cms`. A full product needs all of them.

```json
// package.json
{
  "dependencies": {
    "@web-base/base-ui":         "github:krystianzajac/web-base#main&path=packages/base_ui",
    "@web-base/base-auth":       "github:krystianzajac/web-base#main&path=packages/base_auth",
    "@web-base/base-api":        "github:krystianzajac/web-base#main&path=packages/base_api",
    "@web-base/base-cms":        "github:krystianzajac/web-base#main&path=packages/base_cms",
    "@web-base/base-monitoring": "github:krystianzajac/web-base#main&path=packages/base_monitoring"
  },
  "devDependencies": {
    "@web-base/base-test-utils": "github:krystianzajac/web-base#main&path=packages/base_test_utils"
  }
}
```

```bash
npm install
```

Update `next.config.mjs` so Next.js compiles the package TypeScript source:

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { instrumentationHook: true },
  transpilePackages: [
    '@web-base/base-ui',
    '@web-base/base-auth',
    '@web-base/base-api',
    '@web-base/base-cms',
    '@web-base/base-monitoring',
  ],
}

export default nextConfig
```

---

## 3. Configure the brand

Create `src/brand.ts`. This is the single file that makes your app look different from every other app on web-base.

```ts
// src/brand.ts
import type { AppBrand } from '@web-base/base-ui'

export const myBrand: AppBrand = {
  name: 'My App',
  primaryColor: '#6C63FF',      // your primary CTA colour
  secondaryColor: '#1A1A2E',    // drives text, surfaces, dividers
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FFA726',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  logo: '/assets/logo.svg',
  spacing: 'standard',          // 'standard' | 'compact'
  radius: 'medium',             // 'sharp' | 'medium' | 'rounded'
}
```

Update `tailwind.config.ts` to use it (use the `/tailwind` sub-path — it avoids loading React components in the PostCSS context):

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { createTailwindConfig } from '@web-base/base-ui/tailwind'
import { myBrand } from './src/brand'

export default {
  ...createTailwindConfig(myBrand),
  content: ['./src/**/*.{ts,tsx,mdx}'],
} satisfies Config
```

---

## 4. Set up the provider stack

Create a config module so every package reads from the same environment variables:

```ts
// src/lib/config.ts
import type { ApiConfig } from '@web-base/base-api'
import type { AuthConfig } from '@web-base/base-auth'
import type { CmsConfig } from '@web-base/base-cms'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const apiConfig:  ApiConfig  = { supabaseUrl, supabaseAnonKey: supabaseAnon }
export const authConfig: AuthConfig = { supabaseUrl, supabaseAnonKey: supabaseAnon }
export const cmsConfig:  CmsConfig  = { appId: 'my-app', defaultLocale: 'en', cacheTtlMs: 300_000 }
```

Create a `'use client'` providers wrapper (providers can't be rendered in a Server Component):

```tsx
// src/components/providers.tsx
'use client'

import { useMemo } from 'react'
import { AuthProvider } from '@web-base/base-auth'
import { ApiQueryProvider, createBrowserApiClient } from '@web-base/base-api'
import { CmsProvider } from '@web-base/base-cms'
import { apiConfig, authConfig, cmsConfig } from '@/lib/config'

export function Providers({ children }: { children: React.ReactNode }) {
  const browserApiClient = useMemo(() => createBrowserApiClient(apiConfig), [])
  return (
    <AuthProvider config={authConfig}>
      <ApiQueryProvider>
        <CmsProvider config={cmsConfig} apiClient={browserApiClient}>
          {children}
        </CmsProvider>
      </ApiQueryProvider>
    </AuthProvider>
  )
}
```

Wire everything into the root layout:

```tsx
// src/app/layout.tsx
import { BrandProvider } from '@web-base/base-ui'
import { Providers } from '@/components/providers'
import { myBrand } from '@/brand'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandProvider brand={myBrand}>
          <Providers>{children}</Providers>
        </BrandProvider>
      </body>
    </html>
  )
}
```

`BrandProvider` must be the outermost wrapper so brand tokens are available to all `base_ui` components inside it.

---

## 5. Add authentication

### Sign-in page

```tsx
// src/app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@web-base/base-auth'
import { BaseButton, BaseInput, BaseCard, BaseAlert } from '@web-base/base-ui'
import Link from 'next/link'

export default function SignInPage() {
  const { signIn, signInWithSSO, error } = useAuth()
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
      <BaseCard padding="lg" className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Sign In</h1>

        {error && <BaseAlert variant="error" title="Sign in failed" description={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <BaseInput label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} aria-label="Email address" />
          <BaseInput label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} aria-label="Password" />
          <BaseButton type="submit" variant="primary" loading={loading} className="w-full">
            Sign In
          </BaseButton>
        </form>

        <div className="mt-4 space-y-2">
          <BaseButton variant="secondary" className="w-full" onClick={() => signInWithSSO('google')}>
            Continue with Google
          </BaseButton>
        </div>

        <p className="mt-6 text-sm text-center text-[var(--color-text-secondary)]">
          No account? <Link href="/auth/signup" className="text-[var(--color-primary)] hover:underline">Sign up</Link>
        </p>
      </BaseCard>
    </main>
  )
}
```

Build the sign-up page the same way using `useAuth().signUp(email, password, displayName)`.

### Access the user anywhere

```tsx
'use client'
import { useAuth } from '@web-base/base-auth'

export function UserGreeting() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <p>Not signed in</p>
  return <p>Hello, {user.displayName ?? user.email}</p>
}
```

### Server Component — check session

```tsx
// src/app/dashboard/page.tsx  (Server Component — no 'use client')
import { redirect } from 'next/navigation'
import { getServerSession } from '@web-base/base-auth/server'
import { authConfig } from '@/lib/config'

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)
  if (!session) redirect('/auth/signin')

  return <h1>Welcome, {session.user.email}</h1>
}
```

---

## 6. Protect routes with middleware

```ts
// middleware.ts  (project root, next to package.json)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@web-base/base-auth/server'
import { createMiddlewareApiClient } from '@web-base/base-api'
import { authConfig, apiConfig } from '@/lib/config'

export async function middleware(request: NextRequest) {
  // Always refresh the session cookie first
  const sessionResult = await updateSession(request, authConfig)

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const { client } = createMiddlewareApiClient(request, apiConfig)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  const response = NextResponse.next({ request })
  sessionResult.cookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options ?? {})
  )
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 7. Fetch data

### Generate types first (see [step 11](#11-generate-supabase-types))

Then create a typed client:

```ts
// src/lib/api.ts
import { createBrowserApiClient, createServerApiClient } from '@web-base/base-api'
import { apiConfig } from '@/lib/config'
import type { Database } from '@/lib/database.types'

// Browser client — singleton, call inside useMemo in components
export const browserClient = createBrowserApiClient<Database>(apiConfig)

// Server client — create fresh in each Server Component / Route Handler
export function serverClient() {
  return createServerApiClient<Database>(apiConfig)
}
```

### Client Component query

```tsx
'use client'
import { useApiQuery } from '@web-base/base-api'
import { browserClient } from '@/lib/api'

export function ProfileCard({ userId }: { userId: string }) {
  const { data: profile, loading } = useApiQuery(
    ['profile', userId],
    () => browserClient.from('profiles').select('*').eq('id', userId).maybeSingle(),
  )

  if (loading) return <BaseSkeleton variant="text" width="60%" height={20} />
  return <p>{profile?.display_name ?? 'Anonymous'}</p>
}
```

### Server Component query

```tsx
import { serverClient } from '@/lib/api'

export default async function MembersPage() {
  const { data: members } = await serverClient()
    .from('profiles')
    .select('id, display_name')
    .order('created_at')

  return (
    <ul>
      {members?.map(m => <li key={m.id}>{m.display_name}</li>)}
    </ul>
  )
}
```

### Mutations

```tsx
'use client'
import { useApiMutation } from '@web-base/base-api'
import { browserClient } from '@/lib/api'

export function UpdateNameForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const { mutate, loading } = useApiMutation(
    (displayName: string) =>
      browserClient.from('profiles').update({ display_name: displayName }).eq('id', userId),
  )

  return (
    <form onSubmit={e => { e.preventDefault(); mutate(name) }}>
      <BaseInput label="Display name" value={name} onChange={e => setName(e.target.value)}
        aria-label="Display name" />
      <BaseButton type="submit" variant="primary" loading={loading}>Save</BaseButton>
    </form>
  )
}
```

### Error handling

```ts
import { normaliseError, AuthError, NotFoundError } from '@web-base/base-api'

try {
  const { data } = await serverClient().from('profiles').select().single()
  return data
} catch (err) {
  const e = normaliseError(err)
  if (e instanceof AuthError)    redirect('/auth/signin')
  if (e instanceof NotFoundError) return null
  throw e  // bubble up to the nearest error boundary
}
```

---

## 8. Add CMS content

Content is stored in the shared `cms_content` Supabase table with `(app_id, key, locale)` as the primary key. Your `appId` in `cmsConfig` scopes all reads to your app.

### Text content

```tsx
import { CmsText } from '@web-base/base-cms'

export function HeroSection() {
  return (
    <section>
      <CmsText cmsKey="home.headline" locale="en" fallback="Welcome" as="h1"
        className="text-4xl font-bold text-[var(--color-text-primary)]" />
      <CmsText cmsKey="home.subheadline" locale="en" fallback="Build faster."
        className="text-lg text-[var(--color-text-secondary)]" />
    </section>
  )
}
```

### Image content

```tsx
import { CmsImage } from '@web-base/base-cms'

export function HeroBanner() {
  return <CmsImage cmsKey="home.hero_image" locale="en" alt="Hero banner" fill />
}
```

### Hook for custom rendering

```tsx
'use client'
import { useCms } from '@web-base/base-cms'

export function DynamicBadge() {
  const { content, loading } = useCms('badge.label', 'en')
  if (loading || !content) return null
  return <span className="bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">{content}</span>
}
```

### Adding content to the database

```sql
insert into cms_content (app_id, key, locale, content_json) values
  ('my-app', 'home.headline',    'en', '"Welcome to My App"'),
  ('my-app', 'home.subheadline', 'en', '"Build faster."'),
  ('my-app', 'home.headline',    'fr', '"Bienvenue sur My App"');
```

---

## 9. Add monitoring

### Sentry init

```ts
// instrumentation.ts  (project root)
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  const { initMonitoring } = await import('@web-base/base-monitoring')
  initMonitoring({
    dsn,
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    release: process.env.NEXT_PUBLIC_APP_VERSION,
  })
}
```

### Structured logging — everywhere, instead of console.log

```ts
import { Logger } from '@web-base/base-monitoring'

Logger.info('User signed in', { userId: user.id, method: 'email' })
Logger.warn('Profile missing display_name', { userId })
Logger.error('Payment failed', { orderId, reason: e.message })
```

### Analytics

```ts
import { Analytics } from '@web-base/base-monitoring'

// After user accepts your cookie consent banner:
Analytics.consent(true)

// Track events
Analytics.track('cta_clicked', { label: 'start_trial', page: '/pricing' })
Analytics.identify(user.id, { plan: 'pro' })
```

### Error boundaries

Wrap any section that might throw with `ErrorBoundaryWithMonitoring`. Unhandled errors are automatically sent to Sentry.

```tsx
import { ErrorBoundaryWithMonitoring } from '@web-base/base-monitoring'
import { BaseAlert } from '@web-base/base-ui'

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundaryWithMonitoring
      fallback={
        <BaseAlert
          variant="error"
          title="Something went wrong"
          description="Our team has been notified."
        />
      }
    >
      {children}
    </ErrorBoundaryWithMonitoring>
  )
}
```

---

## 10. Write tests

### Setup

```bash
npm install -D vitest @vitejs/plugin-react jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.tsx'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

```tsx
// src/__tests__/setup.tsx
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter:   () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect:    vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [k: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))
```

### Testing a component

```tsx
// src/__tests__/hero.test.tsx
import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithBrand } from '@web-base/base-test-utils'
import { HeroSection } from '../components/hero-section'

describe('HeroSection', () => {
  it('renders fallback headline when CMS is empty', () => {
    renderWithBrand(<HeroSection />)
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
  })
})
```

### Testing a page with auth

```tsx
import { renderWithBrand, createMockAuthService, TestData } from '@web-base/base-test-utils'

it('shows user display name when signed in', () => {
  const user = TestData.user({ displayName: 'Alice' })
  renderWithBrand(<ProfileCard userId={user.id} />, {
    authState: createMockAuthService({ user }),
  })
  expect(screen.getByText('Alice')).toBeInTheDocument()
})
```

### Testing Supabase calls with MSW

```tsx
import { createMockServer, createSupabaseMockHandlers, TestData } from '@web-base/base-test-utils'
import { waitFor } from '@testing-library/react'

const profile = TestData.user({ displayName: 'Bob' })

// Auto-registers beforeAll / afterEach / afterAll
createMockServer(
  ...createSupabaseMockHandlers('profiles', { rows: [profile] }),
)

it('fetches and displays profile from Supabase', async () => {
  renderWithBrand(<ProfileCard userId={profile.id} />)
  await waitFor(() =>
    expect(screen.getByText('Bob')).toBeInTheDocument()
  )
})
```

### Testing middleware

```ts
import { describe, it, expect, vi } from 'vitest'
import { middleware } from '../../middleware'

vi.mock('@web-base/base-auth/server', () => ({
  updateSession: vi.fn().mockResolvedValue({ cookies: [] }),
}))
vi.mock('@web-base/base-api', () => ({
  createMiddlewareApiClient: vi.fn().mockReturnValue({
    client: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } },
  }),
}))

it('redirects unauthenticated user from /dashboard', async () => {
  const req = new Request('http://localhost/dashboard')
  const res = await middleware(req as NextRequest)
  expect(res.headers.get('location')).toContain('/auth/signin')
})
```

---

## 11. Generate Supabase types

Run this whenever the database schema changes and commit the result alongside your code:

```bash
supabase gen types typescript \
  --project-id your-project-ref \
  > src/lib/database.types.ts
```

The generated `Database` type is passed as a generic to `createBrowserApiClient<Database>` and `createServerApiClient<Database>`, giving you full type safety on every `.from()` call.

If you don't have the Supabase CLI installed:

```bash
npm install -g supabase
supabase login
```

---

## 12. Checklist before shipping

### Code quality
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npx next lint` — zero ESLint warnings
- [ ] `npx vitest run` — all tests green
- [ ] `npx next build` — build succeeds
- [ ] `bash ci/check_compliance.sh src/` — zero compliance errors

### Architecture
- [ ] No `console.log()` — replaced with `Logger.info/warn/error`
- [ ] No raw `fetch()` — all requests go through `base_api`
- [ ] No `<button>`, `<input>`, `<select>` — using `BaseButton`, `BaseInput`, `BaseSelect`
- [ ] No hardcoded colours — using `var(--color-*)` tokens or Tailwind generated classes
- [ ] No direct Supabase imports outside `base_api` / `base_auth`

### Auth and security
- [ ] All protected routes covered by middleware
- [ ] `getServerSession` used in every Server Component that renders user data
- [ ] No secrets committed — all credentials in `.env.local` (gitignored)

### Accessibility
- [ ] All interactive elements have `aria-label` or visible label
- [ ] Keyboard navigation tested (tab order, focus rings visible)
- [ ] Colour contrast passes WCAG 2.1 AA (check with browser devtools)

### Monitoring
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set in production environment
- [ ] `ErrorBoundaryWithMonitoring` wraps each major section
- [ ] `Analytics.consent()` called after user accepts cookie banner

### Before first deploy
- [ ] Supabase types regenerated from latest schema
- [ ] RLS policies tested for your app's `app_id`
- [ ] `NEXT_PUBLIC_APP_VERSION` set (used by Sentry for release tracking)
