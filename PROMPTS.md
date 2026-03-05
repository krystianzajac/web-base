# Phased Prompts — Web Base Build

Feed these to a fresh Claude Code instance one at a time, in order. Wait for each phase to complete (build passes, tests pass) before starting the next.

**Before starting**: Open the `web-base` folder in VS Code. Claude will automatically load `CLAUDE.md` as context. Read it before beginning.

---

## Pre-requisites (do this manually before Prompt 1)

1. Install Node.js 20+: https://nodejs.org (or `brew install node`)
2. Install pnpm: `npm install -g pnpm`
3. Install Turborepo: `pnpm add -g turbo`
4. Create a Supabase project at https://supabase.com (free tier — you can reuse the same project as app-base)
   - Note your **Project URL** and **anon key** (Settings → API)
   - Enable auth providers: Email/Password, Google, Apple, GitHub (Authentication → Providers)
   - Enable TOTP 2FA (Authentication → Multi Factor)
5. Create a Sentry project at https://sentry.io (free tier — you can reuse the same project)
   - Select platform: **Next.js**
   - Note your **DSN** (Settings → Client Keys)
6. Verify you can run: `node --version`, `pnpm --version`, `turbo --version`

---

## Prompt 1 — Turborepo Skeleton + base_ui

```
Read CLAUDE.md in this directory carefully. It is your project instructions for the entire build.

Phase 1: Set up the monorepo and build the UI component library.

1. Initialise the Turborepo monorepo:
   - Create turbo.json at root with pipelines: build, test, lint, typecheck
   - Create root package.json with pnpm workspaces pointing to packages/* and example_app
   - Create all 6 package directories:
     packages/base_ui
     packages/base_auth
     packages/base_api
     packages/base_cms
     packages/base_monitoring
     packages/base_test_utils
   - Each package needs: package.json (name: @web-base/package-name), tsconfig.json, src/index.ts barrel export
   - Create example_app/ as a Next.js 14 App Router project (TypeScript, Tailwind, ESLint)
   - Run `pnpm install` to verify resolution

2. Fully implement packages/base_ui. This is the component library and design system.

   AppBrand config type:
   - primaryColor, secondaryColor, errorColor, successColor, warningColor (hex strings)
   - fonts: { heading: string, body: string, mono: string }
   - logo: string (URL or path)
   - spacing: 'standard' | 'compact'
   - radius: 'sharp' | 'medium' | 'rounded'
   - name: string

   createTailwindConfig(brand: AppBrand):
   - Returns a Tailwind config object with CSS variables for all brand tokens
   - Colours as CSS variables: --color-primary, --color-secondary, --color-error, --color-success, --color-warning, --color-surface, --color-background, --color-text-primary, --color-text-secondary, --color-text-disabled, --color-divider
   - Typography scale: display-large down to label-small
   - Spacing scale: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), xxl(48px)
   - Radius tokens: sharp(2px), medium(8px), rounded(16px), full(9999px)
   - Animation tokens: fast(150ms), normal(300ms), slow(500ms)
   - Dark mode: CSS variables in [data-theme="dark"] selector, auto-derived (darken backgrounds, lighten text, keep brand primary)

   BrandProvider component:
   - Wraps children, injects CSS variables into :root from AppBrand config
   - Handles dark mode toggle via data-theme attribute

   Components (all built on shadcn/ui primitives, all consume CSS variable tokens, never hardcoded values):
   - BaseButton: variants primary (filled), secondary (outlined), tertiary (text-only), destructive. Props: variant, size (sm/md/lg), disabled, loading (shows spinner), onClick, children, aria-label
   - BaseInput: text input with label, placeholder, error message, helper text, disabled state, AutoComplete hint. Props: label, placeholder, error, helperText, disabled, autoComplete, type, value, onChange
   - BaseCard: container with surface colour, radius, optional shadow. Props: children, className, padding (sm/md/lg), shadow (none/subtle/medium/strong)
   - BaseDialog: modal dialog. Props: open, onClose, title, description, children, footer. Static method show() for imperative usage.
   - BaseToast: toast notification. Props: message, variant (info/success/warning/error), duration. Static method show() for imperative usage.
   - BaseToggle: label + switch. Props: label, checked, onChange, disabled, helperText
   - BaseSelect: dropdown select. Props: label, options ({value, label}[]), value, onChange, error, placeholder, disabled
   - BaseBadge: status badge. Props: children, variant (default/primary/success/warning/error), size (sm/md)
   - BaseAvatar: user avatar. Props: src, alt, fallback (initials), size (sm/md/lg/xl)
   - BaseSpinner: loading spinner. Props: size (sm/md/lg), color
   - BaseSkeleton: shimmer placeholder. Props: width, height, className, variant (text/circular/rectangular)
   - BaseAlert: inline alert banner. Props: variant (info/success/warning/error), title, description, dismissible, onDismiss
   - ErrorBoundary: React error boundary component. Props: fallback (ReactNode or function receiving error), children, onError

   Accessibility requirements:
   - All interactive elements have aria-label or visible label
   - Focus rings on all interactive elements (use Tailwind focus-visible:ring)
   - Minimum touch target 44px enforced on mobile (min-h-[44px] or padding)
   - Keyboard navigation works for all components

3. Write unit tests with Vitest + React Testing Library for every component:
   - Renders correctly with default props
   - Responds to brand config (CSS variables applied)
   - Disabled state works
   - aria-label/role present
   - BaseButton loading state shows spinner
   - BaseDialog opens/closes
   - BaseToggle fires onChange
   - ErrorBoundary catches error and shows fallback

4. Run `pnpm turbo test lint typecheck` — all must pass.

5. Commit everything: "feat: turborepo skeleton + base_ui component library"
```

---

## Prompt 2 — base_auth

```
Read CLAUDE.md. Phase 2: implement base_auth — authentication hooks and helpers.

Implement packages/base_auth. It wraps Supabase Auth via @supabase/ssr. No Supabase types leak into the public API.

Dependencies to add to base_auth package.json:
- @supabase/ssr
- @supabase/supabase-js (peer dependency)

AuthConfig type:
- supabaseUrl: string
- supabaseAnonKey: string
- ssoProviders: ('google' | 'apple' | 'github')[]
- redirectUrl: string (for OAuth callbacks)

createAuthClient(config: AuthConfig):
- Returns a typed Supabase auth client (internal to the package — never exposed)

useAuth() hook:
- user: User | null (own User type, not Supabase type)
- loading: boolean
- error: string | null
- signIn(email, password): Promise<void>
- signUp(email, password, displayName): Promise<void>
- signOut(): Promise<void>
- signInWithSSO(provider: 'google' | 'apple' | 'github'): Promise<void>
- resetPassword(email): Promise<void>

useSession() hook:
- session: Session | null (own Session type: { token: string, expiresAt: Date, userId: string })
- isExpired: boolean
- refresh(): Promise<void>

useTwoFactor() hook:
- isEnrolled: boolean
- enroll(): Promise<{ qrUri: string, secret: string }>
- verify(code: string): Promise<void>
- unenroll(): Promise<void>

AuthProvider component:
- Wraps children, manages auth state, listens to Supabase auth state changes
- Required at app root before useAuth/useSession can be used

Server-side helpers (for Next.js App Router):
- createServerClient(cookieStore): Supabase server client (for Server Components)
- createMiddlewareClient(request): Supabase client for middleware
- getServerSession(cookieStore): Promise<Session | null>
- middleware helper: updateSession(request) — refreshes session in middleware

Own User type:
- id: string
- email: string
- displayName: string | null
- avatarUrl: string | null
- createdAt: Date

Own Session type:
- token: string
- expiresAt: Date
- userId: string

Write unit tests (mock Supabase auth client):
- useAuth: sign in success, sign in failure (wrong password), sign up, sign out
- useSession: session present, session expired, refresh
- useTwoFactor: enroll returns QR URI, verify correct code, verify wrong code (error)
- AuthProvider: unauthenticated → sign in → authenticated state transition
- getServerSession: returns session when cookie valid, null when not

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_auth with Supabase SSR, hooks, server helpers"
```

---

## Prompt 3 — base_api

```
Read CLAUDE.md. Phase 3: implement base_api — the data fetching layer.

Implement packages/base_api. All Supabase access goes through this package. Apps never call fetch() or Supabase directly.

Dependencies:
- @supabase/ssr, @supabase/supabase-js (peer)
- @tanstack/react-query

ApiConfig type:
- supabaseUrl: string
- supabaseAnonKey: string
- retryAttempts: number (default 3)
- retryDelay: number (default 1000ms, doubles each retry)
- timeout: number (default 10000ms)

createApiClient(config: ApiConfig):
- Returns an ApiClient instance
- Internally creates typed Supabase client with auth token auto-attachment
- All methods typed — no Supabase types in return values

ApiClient methods:
- query<T>(table: string, filters?: QueryFilters): Promise<T[]>
- queryOne<T>(table: string, filters: QueryFilters): Promise<T | null>
- insert<T>(table: string, data: Partial<T>): Promise<T>
- update<T>(table: string, id: string, data: Partial<T>): Promise<T>
- delete(table: string, id: string): Promise<void>
- rpc<T>(functionName: string, params?: Record<string, unknown>): Promise<T>

QueryFilters type:
- eq?: Record<string, unknown>
- neq?: Record<string, unknown>
- gt?: Record<string, number | string>
- lt?: Record<string, number | string>
- in?: Record<string, unknown[]>
- order?: { column: string, ascending: boolean }
- limit?: number
- offset?: number

Typed error hierarchy (all extend ApiError):
- ApiError: base class. Props: message, code, statusCode, originalError?
- NetworkError: no connectivity or timeout
- AuthError: 401/403 from Supabase
- NotFoundError: 404 / PGRST116
- ConflictError: 409 / unique constraint violation
- ServerError: 500+ from Supabase
- RateLimitError: 429
- UnknownError: catch-all

ErrorMessageMapper:
- mapError(error: ApiError): string — maps to human-readable message
- mapErrorToKey(error: ApiError): string — maps to i18n key string

Retry logic:
- Exponential backoff: 1s → 2s → 4s
- Only retry NetworkError and ServerError (not AuthError, NotFoundError, ConflictError)
- Max attempts from config

ApiQueryProvider component:
- Wraps children in TanStack QueryClientProvider with sensible defaults
- staleTime: 60s, retry: false (base_api handles retries itself), gcTime: 5min

useApiQuery<T>(key, fetcher, options?) hook:
- Thin wrapper around TanStack useQuery
- Accepts an ApiClient method call as fetcher
- Returns { data, loading, error: ApiError | null, refetch }

useApiMutation<T, V>(mutator, options?) hook:
- Thin wrapper around TanStack useMutation
- Returns { mutate, loading, error: ApiError | null, data }

Write unit tests (mock Supabase client and fetch):
- query: successful fetch, empty result, maps to correct type
- insert: success, conflict error mapped to ConflictError
- update: success, not found mapped to NotFoundError
- delete: success, auth error mapped to AuthError
- Retry: retries NetworkError 3 times with backoff, does not retry AuthError
- ErrorMessageMapper: maps each error type to a non-empty string
- useApiQuery: loading → data transition, error state
- useApiMutation: triggers mutation, returns data on success, ApiError on failure

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_api with typed errors, retry, TanStack Query wrappers"
```

---

## Prompt 4 — base_monitoring

```
Read CLAUDE.md. Phase 4: implement base_monitoring — Sentry, structured logging, analytics.

Implement packages/base_monitoring. This should be initialised at app startup and used everywhere instead of console.log.

Dependencies:
- @sentry/nextjs

MonitoringConfig type:
- dsn: string
- environment: 'dev' | 'staging' | 'prod'
- release?: string
- tracesSampleRate?: number (default 0.1 in prod, 1.0 in dev)
- debug?: boolean

initMonitoring(config: MonitoringConfig): void
- Calls Sentry.init with config
- Sets environment and release
- Must be called in instrumentation.ts (Next.js) at app startup

Logger (static class):
- Logger.info(message: string, data?: Record<string, unknown>): void
- Logger.warn(message: string, data?: Record<string, unknown>): void
- Logger.error(message: string, error?: Error, data?: Record<string, unknown>): void
- Logger.debug(message: string, data?: Record<string, unknown>): void
- In dev: logs to console with structured format
- In prod: sends to Sentry as breadcrumbs (info/warn/debug) or captureException (error)
- Never exposes console.log directly — Logger is the only allowed logging mechanism

setUserContext(userId: string, properties?: Record<string, unknown>): void
- Attaches user context to all future Sentry events
- Uses anonymous ID (not email)

clearUserContext(): void
- Clears Sentry user context on sign out

PerformanceTracer:
- startTrace(name: string): Trace — returns handle
- endTrace(trace: Trace): void
- withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> — wraps async function in trace

ErrorBoundaryWithMonitoring component:
- React error boundary that also calls Sentry.captureException
- Props: fallback, children, onError?

AnalyticsConfig type:
- enabled: boolean
- supabaseClient?: SupabaseClient (for writing to analytics_events table)

Analytics (static class, requires initAnalytics(config) called first):
- Analytics.screen(name: string, properties?: Record<string, unknown>): void
- Analytics.event(name: string, properties?: Record<string, unknown>): void
- Analytics.funnel(step: string, funnelName: string): void
- All methods no-op if config.enabled is false (consent not given)
- Writes to Supabase analytics_events table when supabaseClient provided

Write unit tests:
- Logger: info/warn/error/debug call correct Sentry methods in prod mode
- Logger: console.log called in dev mode, not in prod mode
- Logger.error: calls Sentry.captureException with error
- setUserContext: Sentry.setUser called with correct anonymised ID
- PerformanceTracer: start/end trace calls Sentry span methods
- Analytics: events not fired when enabled=false
- Analytics: events fired when enabled=true

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_monitoring with Sentry, Logger, Analytics"
```

---

## Prompt 5 — base_cms

```
Read CLAUDE.md. Phase 5: implement base_cms — CMS content service.

Implement packages/base_cms. Reads from the cms_content Supabase table (same table used by app-base Flutter apps). Cache in localStorage with TTL.

The cms_content table schema (already exists in Supabase):
  id uuid, app_id text, key text, locale text, content_json jsonb, version int, created_at timestamptz, updated_at timestamptz
  Unique on (app_id, key, locale)

CmsConfig type:
- supabaseUrl: string
- supabaseAnonKey: string
- appId: string
- defaultLocale: string (e.g. 'en')
- cacheTtlMs: number (default 300000 = 5 min)
- fallbackToDefaultLocale: boolean (default true)

CmsProvider component:
- Wraps children, provides CMS context
- Required at app root

useCms(key: string, locale?: string) hook:
- Returns { content: string | null, loading: boolean, error: string | null }
- Fetches from Supabase on first call, caches in localStorage
- Cache key: cms_{appId}_{key}_{locale}
- On cache hit within TTL: returns cached value immediately, no network call
- On cache miss or expired: fetches from Supabase, updates cache
- If locale not found and fallbackToDefaultLocale=true: retries with defaultLocale
- If not found at all: content is null

useCmsJson<T>(key: string, locale?: string) hook:
- Same as useCms but parses content_json as typed T
- Returns { data: T | null, loading: boolean, error: string | null }

CmsText component:
- Props: cmsKey: string, locale?: string, fallback?: string, className?: string
- Renders text from CMS. Shows fallback (or nothing) while loading or on error.
- Renders a BaseSkeleton while loading if no fallback provided

CmsImage component:
- Props: cmsKey: string, locale?: string, alt: string, fallback?: string, className?: string, width?, height?
- Renders Next.js Image from CMS URL. Shows fallback src on error.

preloadCms(keys: string[], locale: string, config: CmsConfig): Promise<void>
- Server-side helper: fetch multiple CMS keys at once, returns them for RSC data passing
- Used in Next.js layout.tsx to preload content before page render

Write unit tests (mock Supabase client, mock localStorage):
- useCms: cache miss → fetches from Supabase → caches result
- useCms: cache hit within TTL → returns cached, no network call
- useCms: cache expired → re-fetches
- useCms: locale not found → falls back to defaultLocale
- useCms: key not found → content is null
- useCmsJson: parses JSON correctly, handles malformed JSON gracefully
- CmsText: shows skeleton while loading, shows content when loaded, shows fallback on error
- preloadCms: fetches all keys in a single Supabase query (not N queries)

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_cms with locale-aware content, localStorage cache"
```

---

## Prompt 6 — base_test_utils

```
Read CLAUDE.md. Phase 6: implement base_test_utils — shared test infrastructure.

Implement packages/base_test_utils. This is a devDependency only — never imported in production code.

Dependencies (all devDependencies):
- vitest
- @testing-library/react
- @testing-library/user-event
- @testing-library/jest-dom
- msw (Mock Service Worker — for mocking fetch/Supabase HTTP calls)

renderWithBrand(ui: ReactElement, options?: { brand?: AppBrand, locale?: string, queryClient?: QueryClient }): RenderResult
- Wraps component in: BrandProvider, AuthProvider (with MockAuthService), ApiQueryProvider, CmsProvider
- One function replaces all provider boilerplate in every test
- Returns everything from @testing-library/react render

MockAuthService:
- createMockAuthService(overrides?: Partial<MockAuthState>): MockAuthState
- Default state: user = null, loading = false, error = null
- Configurable: initialUser (pre-authenticated), signIn result (success or throw AuthError), signUp result, signOut behaviour
- All mock methods are vi.fn() — can assert they were called

MockApiClient:
- createMockApiClient(responses?: MockResponses): MockApiClient
- MockResponses: map of table name → { query: T[], queryOne: T | null, insert: T, update: T }
- Default: returns empty arrays / null
- Can inject errors: createMockApiClient({ errorOn: { query: new NetworkError('offline') } })
- All methods are vi.fn() — can assert calls and arguments

MockCmsService:
- createMockCmsService(content?: Record<string, string>): MockCmsService
- content: map of key → string value
- useCms mock: returns content[key] if present, null if not
- All hooks return { content, loading: false, error: null } synchronously (no async in tests)

MockLogger:
- createMockLogger(): captures all Logger calls
- mockLogger.info, .warn, .error, .debug are all vi.fn()
- mockLogger.getCallsFor(level): returns all calls for a log level

MockAnalytics:
- createMockAnalytics(): captures all Analytics calls
- mockAnalytics.events: recorded event list
- mockAnalytics.wasEventFired(name): boolean

TestData generators:
- TestData.user(overrides?: Partial<User>): User — realistic User with unique uuid, sensible defaults
- TestData.session(overrides?: Partial<Session>): Session — valid Session, expires 1 hour from now
- TestData.cmsEntry(overrides?: Partial<CmsEntry>): CmsEntry — CMS content entry
- All fields overridable, auto-generated unique IDs via crypto.randomUUID()

TestBrands:
- TestBrands.plain: default brand with garish colours to prove theming works
- TestBrands.dark: brand optimised for dark mode testing
- TestBrands.compact: minimal spacing config

MSW server setup helpers:
- createMockServer(...handlers: RequestHandler[]): SetupServer — pre-configured MSW server
- supabaseMockHandler(table: string, response: unknown): RequestHandler — intercepts Supabase REST calls for a table

Self-tests:
- renderWithBrand: verify BrandProvider + AuthProvider are in the tree
- MockAuthService: signIn success path, signIn error path
- MockApiClient: query returns configured response, error injection works
- TestData: users have unique IDs, overrides applied correctly

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_test_utils with mocks, renderWithBrand, TestData generators"
```

---

## Prompt 7 — Example App

```
Read CLAUDE.md. Phase 7: build example_app — a Next.js app demonstrating all packages working together.

Build example_app/ as a Next.js 14 App Router app that imports and uses all web-base packages.

### Setup:
- Import all packages from packages/*
- Write a plain AppBrand config (deliberately garish colours — proves theming is from config)
- Environment variables (use .env.local, never commit): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SENTRY_DSN
- Initialise monitoring in instrumentation.ts (Next.js convention)
- AuthProvider + BrandProvider + ApiQueryProvider + CmsProvider wrapping the whole app in app/layout.tsx

### Pages (App Router structure):

app/page.tsx — Home (public):
- CMS welcome headline via <CmsText cmsKey="home.headline" />
- Sign in link → /auth/signin
- Sign up link → /auth/signup

app/auth/signin/page.tsx:
- BaseInput for email + password
- BaseButton "Sign In" (loading state while signing in)
- Link to /auth/signup
- "Forgot password?" link
- SSO buttons (Google, GitHub) — BaseButton variant secondary
- Error message via BaseAlert on failure

app/auth/signup/page.tsx:
- BaseInput for email, password, display name
- BaseButton "Create Account"
- Link to /auth/signin
- Error message via BaseAlert

app/dashboard/page.tsx — protected:
- Redirect to /auth/signin if not authenticated (middleware)
- Welcome message: "Hello, {displayName}"
- BaseCard with user details
- Navigation to /dashboard/settings and /dashboard/chat
- Sign out button

app/dashboard/settings/page.tsx — protected:
- Display current user info
- Dark mode toggle (BaseToggle) — toggles data-theme attribute
- Sign out button

app/dashboard/chat/page.tsx — placeholder:
- Simple textarea + BaseButton "Send" (hardcoded echo for now — no AI backend yet)
- Demonstrates base_ui components

### Middleware (middleware.ts):
- Protect /dashboard/* routes — redirect to /auth/signin if no session
- Use createMiddlewareClient from base_auth

### Must demonstrate:
- BrandProvider applying CSS variables (check in browser devtools)
- BaseButton all variants (show a demo section on home page)
- BaseInput with validation error state
- BaseAlert for error messages
- CmsText loading CMS content (or falling back gracefully if no Supabase connection)
- Dark mode toggle working
- Auth flow: sign up → dashboard → sign out → sign in

### Tests (Vitest + React Testing Library):
- Home page: renders CmsText, shows sign in/up links
- Sign in page: form renders, submit calls useAuth().signIn, error displays on failure (use MockAuthService)
- Sign up page: form renders, submit calls useAuth().signUp
- Dashboard: redirects when unauthenticated, shows content when authenticated (use MockAuthService pre-authenticated)
- Middleware: protected routes redirect, unprotected routes pass through

Run `pnpm turbo build test lint typecheck` — all must pass.
Commit: "feat: example_app demonstrating all web-base packages"
```

---

## Prompt 8 — CI + Documentation + Final Polish

```
Read CLAUDE.md. Phase 8: CI/CD pipeline, documentation, and quality pass.

### GitHub Actions (.github/workflows/):

ci.yml (trigger: push + PR to main):
  jobs:
    typecheck:
      - pnpm install --frozen-lockfile
      - pnpm turbo typecheck

    lint:
      - pnpm install --frozen-lockfile
      - pnpm turbo lint

    test:
      - pnpm install --frozen-lockfile
      - pnpm turbo test -- --coverage
      - Upload coverage report as artifact

    build:
      - pnpm install --frozen-lockfile
      - pnpm turbo build
      - needs: [typecheck, lint, test]

    compliance:
      - Check for banned patterns in example_app/
      - Banned: console.log, direct fetch(), hardcoded hex colours in JSX/TSX, <button (raw HTML), <input (raw HTML)
      - Script: ci/check_compliance.sh example_app/
      - continue-on-error: true (warn, don't block)

ci/check_compliance.sh:
  Write a bash script (same structure as app-base's check_base_compliance.sh) that scans .tsx/.ts files for:
  ERRORS (exit 1 if found):
    console\.log — use Logger
    \bfetch\( — use base_api
    <button[ >] — use BaseButton
    <input[ >] — use BaseInput
    <select[ >] — use BaseSelect
  WARNINGS (exit 0 with message):
    #[0-9a-fA-F]{6} in className — hardcoded hex colour, use CSS variable token
    style={{ — inline styles, prefer Tailwind tokens

### Documentation:

Root README.md:
- What web-base is (2 sentences)
- Relationship to app-base
- Package list with one-line descriptions
- Prerequisites
- Getting started: pnpm install, pnpm turbo dev (runs example_app)
- How a new app consumes these packages (package.json dependency example)
- How to run tests: pnpm turbo test
- How to add a package

Each package (packages/*/README.md):
- Purpose (one paragraph)
- Installation snippet
- Quick start code example (10-15 lines)
- Key exports list

CONTRIBUTING.md:
- How to add a new package (step-by-step)
- How to modify an existing package
- Testing requirements: unit tests for all exports, renderWithBrand for components
- Commit convention: feat:, fix:, refactor:, docs:, test:, chore:
- PR process: CI must pass, one logical change per PR

### Final quality pass:
- Run `pnpm turbo typecheck` — zero TypeScript errors
- Run `pnpm turbo lint` — zero ESLint warnings
- Run `pnpm turbo test` — all green
- Run `pnpm turbo build` — builds successfully
- Verify every package has: package.json, tsconfig.json, src/index.ts, README.md, at least one test file
- Verify example_app builds: pnpm --filter example_app build

Commit: "docs: CI, compliance check, documentation, contributing guide"
```

---

## After All Prompts Complete

You now have a working web platform scaffold. To build a new web app:

1. Create a Next.js project: `npx create-next-app@latest my-app --typescript --tailwind --app`
2. Add web-base dependencies to `package.json` (only the packages you need)
3. Write a 20-line `AppBrand` config
4. Wrap your app in `BrandProvider + AuthProvider + ApiQueryProvider`
5. Build pages using `base_ui` components — never raw HTML elements
6. Ship with auth, data fetching, error handling, monitoring — all handled

For an app that also has a Flutter counterpart (using app-base), the Supabase backend is shared — same database, same Edge Functions, same auth. No backend changes needed.

---

## Troubleshooting

**"pnpm install fails"** → check Node.js version is 20+. Delete `node_modules` and `pnpm-lock.yaml`, then re-run `pnpm install`.

**"Turborepo can't find packages"** → check `pnpm-workspace.yaml` lists `packages/*` and `example_app`. Check each package `package.json` has the correct `name` field.

**"TypeScript errors on import"** → check `tsconfig.json` in consuming package has `"references"` pointing to the dependency. Check the dependency's `package.json` has a `"main"` and `"types"` field pointing to its built output.

**"Supabase auth not working in App Router"** → must use `@supabase/ssr`, not `@supabase/supabase-js` directly. Cookies must be passed through server components. Check middleware calls `updateSession`.

**"CSS variables not applying"** → check `BrandProvider` is at the root of the tree above the component. Check `createTailwindConfig` is called in `tailwind.config.ts` and the output is spread into the config.

**"Tests failing with 'window is not defined'"** → add `environment: 'jsdom'` to `vitest.config.ts`. Check `localStorage` access is wrapped in a `typeof window !== 'undefined'` guard in non-test code.

**"MSW not intercepting Supabase calls"** → Supabase uses the fetch API. MSW must be set up before the test runs: `server.listen()` in beforeAll, `server.resetHandlers()` in afterEach, `server.close()` in afterAll.
```
