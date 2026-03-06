# @web-base/base-auth

Supabase Auth integration for Next.js App Router. Wraps `@supabase/ssr` so no Supabase types leak into your application code. Provides hooks for the client, server helpers for Server Components and middleware, SSO for Google / Apple / GitHub, and TOTP-based 2FA enroll/verify.

## Installation

```json
{
  "dependencies": {
    "@web-base/base-auth": "github:krystianzajac/web-base#main&path=packages/base_auth"
  }
}
```

Add to `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-auth']
```

## Quick start

```tsx
// app/layout.tsx (Server Component)
import { AuthProvider } from '@web-base/base-auth'

const authConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider config={authConfig}>{children}</AuthProvider>
      </body>
    </html>
  )
}

// Any Client Component
'use client'
import { useAuth } from '@web-base/base-auth'

export function SignInButton() {
  const { signIn, loading, error } = useAuth()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      signIn(email, password)
    }}>
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>Sign In</button>
    </form>
  )
}
```

### Server Component

```tsx
import { getServerSession } from '@web-base/base-auth/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)
  if (!session) redirect('/auth/signin')
  return <div>Welcome, {session.user.email}</div>
}
```

### Middleware

```ts
// middleware.ts
import { updateSession } from '@web-base/base-auth/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return updateSession(request, authConfig)
}
```

## Key exports

### Client (`@web-base/base-auth`)

| Export | Description |
|---|---|
| `AuthProvider` | Context provider — wraps children, manages session refresh |
| `useAuth()` | `{ user, session, loading, error, signIn, signUp, signOut, signInWithSSO, resetPassword, refresh, mfaIsEnrolled, mfaEnroll, mfaVerify, mfaUnenroll }` |
| `useSession()` | `{ session, token, expiresAt }` |
| `AuthContext` | Raw React context — use for injecting mocks in tests |
| `AuthConfig` | Config type |
| `User`, `Session`, `SsoProvider` | Public-facing types (no Supabase types exposed) |

### Server (`@web-base/base-auth/server`)

| Export | Description |
|---|---|
| `getServerSession(config)` | Returns `Session \| null` from cookie — use in Server Components |
| `updateSession(request, config)` | Refreshes session cookie — use in middleware |
