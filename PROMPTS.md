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

Implement packages/base_api. All Supabase access goes through clients created by this package.
Apps never call fetch() directly or instantiate Supabase clients themselves.

IMPORTANT DESIGN DECISION: base_api exposes the full Supabase typed query builder
rather than hiding it behind a generic query(table, filters) method. This preserves
Supabase's TypeScript type generation (supabase gen types typescript), which gives
column-level type safety, autocomplete, and join types. base_api wraps the client
with retry logic, error normalisation, and auth attachment — but does not restrict
what queries can be expressed.

Dependencies:
- @supabase/ssr, @supabase/supabase-js
- @tanstack/react-query

ApiConfig type:
- supabaseUrl: string
- supabaseAnonKey: string
- retryAttempts: number (default 3)
- retryDelay: number (default 1000ms, doubles each retry — exponential backoff)
- timeout: number (default 10000ms)

Database type parameter:
- All client factories accept an optional generic: createBrowserApiClient<Database>(config)
- Database comes from running `supabase gen types typescript` in the consuming app
- When provided, all .from('table') calls are fully typed (columns, inserts, updates, relations)
- When not provided (no generated types yet), falls back to any — still works

createBrowserApiClient<TDatabase = any>(config: ApiConfig):
- For use in Client Components and browser contexts
- Returns a wrapped Supabase client with:
  - Auth token auto-attached on every request
  - All Supabase errors normalised to typed ApiError hierarchy (see below)
  - Retry with exponential backoff on NetworkError and ServerError only
  - Full Supabase query builder interface preserved (.from(), .rpc(), .storage, etc.)
- Usage: const client = createBrowserApiClient<Database>(config)
         const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
         // error is ApiError | null — normalised, not raw Supabase error

createServerApiClient<TDatabase = any>(cookieStore, config: ApiConfig):
- For use in Server Components, Server Actions, and Route Handlers
- Same interface as browser client but uses @supabase/ssr createServerClient internally
- Reads/writes session from Next.js cookie store
- Usage: const client = createServerApiClient<Database>(cookieStore, config)
         const { data } = await client.from('profiles').select('*').eq('id', userId).single()

createMiddlewareApiClient<TDatabase = any>(request, response, config: ApiConfig):
- For use in Next.js middleware only
- Handles session refresh in middleware context

Typed error hierarchy (all extend ApiError):
- ApiError: base class. Props: message, code, statusCode, originalError?
- NetworkError: no connectivity or timeout
- AuthError: 401/403
- NotFoundError: 404 / PGRST116
- ConflictError: 409 / unique constraint violation
- ServerError: 500+
- RateLimitError: 429
- UnknownError: catch-all

Error normalisation:
- Wrap all Supabase query results: if (error) throw normaliseError(error)
- normaliseError(error): maps PostgrestError, AuthError, and fetch errors → typed ApiError subclass
- This happens transparently — callers use .data and .error as normal but .error is always ApiError | null

ErrorMessageMapper:
- mapError(error: ApiError): string — human-readable message
- mapErrorToKey(error: ApiError): string — i18n key

ApiQueryProvider component:
- Wraps children in TanStack QueryClientProvider
- staleTime: 60s, retry: false (base_api handles retries), gcTime: 5min

useApiQuery<T>(key: QueryKey, fetcher: () => Promise<T>, options?) hook:
- Thin wrapper around TanStack useQuery
- Returns { data, loading, error: ApiError | null, refetch }

useApiMutation<T, V>(mutator: (vars: V) => Promise<T>, options?) hook:
- Thin wrapper around TanStack useMutation
- Returns { mutate, loading, error: ApiError | null, data }

Write unit tests (use MSW to intercept Supabase HTTP calls — do not mock the Supabase client directly):
- Successful query: MSW returns rows → data typed correctly
- NotFoundError: MSW returns PGRST116 → normalised to NotFoundError
- AuthError: MSW returns 401 → normalised to AuthError
- ConflictError: MSW returns 409 → normalised to ConflictError
- NetworkError: MSW network failure → retried 3 times with backoff → throws NetworkError
- ServerError: MSW returns 500 → retried → throws ServerError
- AuthError: NOT retried
- ErrorMessageMapper: each error type maps to non-empty string
- useApiQuery: loading → data, error state
- useApiMutation: fires mutation, returns data, returns ApiError on failure

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_api with typed query builder wrapper, error normalisation, retry"
```

---

## Prompt 4 — base_monitoring

```
Read CLAUDE.md. Phase 4: implement base_monitoring — Sentry, structured logging, analytics.

Implement packages/base_monitoring. Initialise at app startup. Use instead of console.log everywhere.

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
- Must be called in instrumentation.ts (Next.js) at app startup

Logger (static class):
- Logger.info(message: string, data?: Record<string, unknown>): void
- Logger.warn(message: string, data?: Record<string, unknown>): void
- Logger.error(message: string, error?: Error, data?: Record<string, unknown>): void
- Logger.debug(message: string, data?: Record<string, unknown>): void
- In dev: structured console output
- In prod: Sentry breadcrumbs for info/warn/debug, Sentry.captureException for error
- No console.log anywhere in production code — Logger is the only logging mechanism

setUserContext(userId: string, properties?: Record<string, unknown>): void
- Attaches anonymous user context to Sentry events (never email)

clearUserContext(): void
- Clears on sign out

PerformanceTracer:
- startTrace(name: string): Trace
- endTrace(trace: Trace): void
- withTrace<T>(name: string, fn: () => Promise<T>): Promise<T>

ErrorBoundaryWithMonitoring component:
- React error boundary that also calls Sentry.captureException
- Props: fallback, children, onError?

AnalyticsConfig type:
- enabled: boolean
- apiClient?: ReturnType<typeof createBrowserApiClient> (from base_api — use the shared client, do not create a new Supabase connection)

Analytics (static class, requires initAnalytics(config) called first):
- Analytics.screen(name: string, properties?: Record<string, unknown>): void
- Analytics.event(name: string, properties?: Record<string, unknown>): void
- Analytics.funnel(step: string, funnelName: string): void
- All methods no-op if config.enabled is false
- Writes to analytics_events table via config.apiClient when provided
- IMPORTANT: accepts the existing apiClient from base_api rather than creating its own Supabase client

Write unit tests:
- Logger.info/warn/debug: Sentry.addBreadcrumb called in prod, console in dev
- Logger.error: Sentry.captureException called with error object
- Logger: no console output in prod mode
- setUserContext: Sentry.setUser called with correct anonymised ID
- PerformanceTracer: withTrace resolves value, calls span start/end
- Analytics: no events when enabled=false
- Analytics: events recorded when enabled=true
- Analytics: uses provided apiClient, does not create new Supabase instance

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_monitoring with Sentry, Logger, Analytics"
```

---

## Prompt 5 — base_cms

```
Read CLAUDE.md. Phase 5: implement base_cms — CMS content service.

Implement packages/base_cms. Reads from the cms_content Supabase table (same table used by
app-base Flutter apps). Supports both Client Components (browser) and Server Components (SSR).

The cms_content table schema (already exists in Supabase):
  id uuid, app_id text, key text, locale text, content_json jsonb, version int,
  created_at timestamptz, updated_at timestamptz
  Unique on (app_id, key, locale)

CmsConfig type:
- supabaseUrl: string
- supabaseAnonKey: string
- appId: string
- defaultLocale: string (e.g. 'en')
- cacheTtlMs: number (default 300000 = 5 min)
- fallbackToDefaultLocale: boolean (default true)

CLIENT-SIDE (Browser / Client Components):

CmsProvider component:
- Wraps children, provides CMS context
- Accepts config and an apiClient (ReturnType<typeof createBrowserApiClient> from base_api)
- Uses the passed-in client — does not create its own Supabase connection
- Required at app root

useCms(key: string, locale?: string) hook:
- Returns { content: string | null, loading: boolean, error: string | null }
- Cache in localStorage. Key: cms_{appId}_{key}_{locale}
- Cache hit within TTL: return immediately, no network call
- Cache miss or expired: fetch via apiClient, update cache
- If locale not found and fallbackToDefaultLocale=true: retry with defaultLocale
- If not found at all: content is null

useCmsJson<T>(key: string, locale?: string) hook:
- Same as useCms but parses content_json as typed T
- Returns { data: T | null, loading: boolean, error: string | null }

CmsText component:
- Props: cmsKey, locale?, fallback?, className?
- Shows BaseSkeleton (from base_ui) while loading if no fallback provided

CmsImage component:
- Props: cmsKey, locale?, alt, fallback?, className?, width?, height?
- Renders Next.js Image from CMS URL, shows fallback on error

SERVER-SIDE (Server Components / RSC):

createServerCmsClient(cookieStore, config: CmsConfig):
- Uses createServerApiClient from base_api internally
- Returns server-side CMS methods (not hooks — plain async functions)

Server CMS methods:
- getCmsContent(key: string, locale: string): Promise<string | null>
- getCmsJson<T>(key: string, locale: string): Promise<T | null>
- preloadCms(keys: string[], locale: string): Promise<Record<string, string>>
  - Fetches all keys in a SINGLE Supabase query (not N queries — use .in() filter)
  - Used in layout.tsx to preload content before page render
  - Returns map of key → content string

Write unit tests (MSW for Supabase HTTP calls, mock localStorage):
- useCms: cache miss → fetches → caches result
- useCms: cache hit within TTL → no network call
- useCms: expired cache → re-fetches
- useCms: locale not found → falls back to defaultLocale
- useCms: key not found → content is null
- useCmsJson: parses JSON, handles malformed JSON gracefully (returns null, not throw)
- CmsText: skeleton while loading, content when loaded, fallback on error
- preloadCms: issues a single Supabase query for all keys (assert MSW received one request, not many)
- getCmsContent: returns content from server client

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_cms with client hooks, server helpers, localStorage cache"
```

---

## Prompt 6 — base_test_utils

```
Read CLAUDE.md. Phase 6: implement base_test_utils — shared test infrastructure.

Implement packages/base_test_utils. devDependency only — never imported in production code.

Dependencies (all devDependencies):
- vitest
- @testing-library/react
- @testing-library/user-event
- @testing-library/jest-dom
- msw (Mock Service Worker)

renderWithBrand(ui: ReactElement, options?: { brand?: AppBrand, locale?: string, queryClient?: QueryClient }): RenderResult
- Wraps component in: BrandProvider, AuthProvider (with mock auth), ApiQueryProvider, CmsProvider
- One function replaces all provider boilerplate in every test
- Returns everything from @testing-library/react render

MockAuthService:
- createMockAuthService(overrides?: Partial<MockAuthState>): MockAuthState
- Default: user = null, loading = false, error = null
- Configurable: initialUser (pre-authenticated), signIn result (success or throw AuthError), signUp result
- All mock methods are vi.fn()

MockApiClient:
- Do NOT mock a query(table, filters) method — that design was rejected.
- Instead, provide MSW request handlers that intercept Supabase HTTP calls.
- createSupabaseMockHandlers(tableName: string, options: MockTableOptions): RequestHandler[]
  - MockTableOptions: { rows?: unknown[], insertResponse?: unknown, error?: { code: string, message: string } }
  - Intercepts GET /rest/v1/{tableName} → returns rows
  - Intercepts POST /rest/v1/{tableName} → returns insertResponse
  - Intercepts PATCH /rest/v1/{tableName} → returns updated row
  - Intercepts DELETE /rest/v1/{tableName} → returns 204
  - If error set: returns the Supabase error shape ({ code, message, details, hint })
- createMockServer(...handlers: RequestHandler[]): SetupServer
  - Pre-configured MSW server (listen in beforeAll, resetHandlers in afterEach, close in afterAll)
- This approach means tests exercise the real error normalisation path in base_api

MockCmsService:
- createMockCmsHandlers(appId: string, content: Record<string, string>): RequestHandler[]
  - Intercepts Supabase CMS table queries, returns matching content rows
- useCms mock for unit tests where MSW is overkill:
  - createMockCmsHook(content: Record<string, string>): returns { content, loading: false, error: null }

MockLogger:
- createMockLogger(): captures all Logger calls
- mockLogger.info, .warn, .error, .debug are all vi.fn()
- mockLogger.getCallsFor(level): returns all calls at that level

MockAnalytics:
- createMockAnalytics(): captures Analytics calls
- mockAnalytics.events: recorded event list
- mockAnalytics.wasEventFired(name): boolean

TestData generators:
- TestData.user(overrides?: Partial<User>): User — unique uuid, sensible defaults
- TestData.session(overrides?: Partial<Session>): Session — expires 1 hour from now
- TestData.cmsEntry(overrides?: Partial<CmsEntry>): CmsEntry
- All fields overridable, auto-generated IDs via crypto.randomUUID()

TestBrands:
- TestBrands.plain — garish colours to prove theming works
- TestBrands.dark — dark mode testing
- TestBrands.compact — minimal spacing

Self-tests:
- renderWithBrand: BrandProvider and AuthProvider are in the tree
- createSupabaseMockHandlers: GET returns configured rows, error shape returned on error config
- TestData: users have unique IDs, overrides applied
- MockLogger: captures calls at correct level

Run `pnpm turbo test lint typecheck` — all must pass.
Commit: "feat: base_test_utils with MSW handlers, renderWithBrand, TestData"
```

---

## Prompt 7 — Example App

```
Read CLAUDE.md. Phase 7: build example_app — a Next.js app demonstrating all packages.

Build example_app/ as a Next.js 14 App Router app importing all web-base packages.

### Setup:
- Import all packages from packages/*
- Write a plain AppBrand config (garish colours — proves theming is from config, not hardcoded)
- Environment variables in .env.local (never commit): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SENTRY_DSN
- Run `supabase gen types typescript` and save output to lib/database.types.ts — pass Database type to all client factories
- Single client factory pattern: create one browser client and one server client factory, share them across the app. Do not instantiate Supabase clients anywhere except through base_api factory functions.
- Initialise monitoring in instrumentation.ts
- app/layout.tsx: BrandProvider + AuthProvider + ApiQueryProvider + CmsProvider wrapping the whole app

### Data fetching patterns to demonstrate:

Server Component (app/dashboard/page.tsx):
  const cookieStore = cookies()
  const client = createServerApiClient<Database>(cookieStore, apiConfig)
  const { data: profile } = await client.from('profiles').select('*').eq('id', userId).single()

Client Component (components/profile-card.tsx):
  const client = useMemo(() => createBrowserApiClient<Database>(apiConfig), [])
  const { data: profile } = useApiQuery(['profile', userId], () =>
    client.from('profiles').select('*').eq('id', userId).single()
  )

### Pages (App Router structure):

app/page.tsx — Home (public):
- CmsText for welcome headline (demonstrates CMS)
- Sign in / sign up links
- BaseButton variant showcase (primary, secondary, tertiary, destructive)

app/auth/signin/page.tsx:
- BaseInput for email + password
- BaseButton "Sign In" with loading state
- SSO buttons (Google, GitHub) as BaseButton secondary
- BaseAlert for errors
- Link to sign up

app/auth/signup/page.tsx:
- BaseInput for email, password, display name
- BaseButton "Create Account"
- BaseAlert for errors

app/dashboard/page.tsx — protected, Server Component:
- Fetch profile server-side using createServerApiClient
- Display welcome message and profile data
- Pass data to client components as props (no double-fetch)
- BaseSkeleton shown in client components before hydration

app/dashboard/settings/page.tsx — protected:
- Display current user info
- Dark mode BaseToggle — toggles data-theme on <html>
- Sign out button

app/dashboard/chat/page.tsx — placeholder:
- Simple textarea + BaseButton "Send" (echo for now)
- Demonstrates base_ui layout components

### Middleware (middleware.ts):
- Protect /dashboard/* — redirect to /auth/signin if no session
- Use createMiddlewareClient from base_auth + createMiddlewareApiClient from base_api

### Must demonstrate:
- Server Component fetching with createServerApiClient (type-safe, cookie-aware)
- Client Component fetching with useApiQuery + createBrowserApiClient
- BrandProvider CSS variables (visible in browser devtools)
- BaseButton all variants
- BaseInput with validation error
- BaseAlert for error messages
- CmsText loading CMS content (graceful fallback if Supabase not connected)
- Dark mode toggle
- Full auth flow: sign up → dashboard → sign out → sign in
- Error boundary (add a "Trigger Error" button in settings for demo purposes)

### Tests:
- Home page: renders CmsText, shows sign in/up links
- Sign in: form submits, calls useAuth().signIn, error shown on failure (use MockAuthService + MSW handlers)
- Sign up: form submits, calls useAuth().signUp
- Dashboard: redirects when unauthenticated, shows profile data when authenticated (MSW returns mock profile row)
- Middleware: protected routes redirect, unprotected pass through

Run `pnpm turbo build test lint typecheck` — all must pass.
Commit: "feat: example_app with Server Components, client hooks, full auth flow"
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
      - Upload coverage as artifact

    build:
      - pnpm install --frozen-lockfile
      - pnpm turbo build
      - needs: [typecheck, lint, test]

    compliance:
      - Run ci/check_compliance.sh against example_app/
      - continue-on-error: true

ci/check_compliance.sh:
  Bash script scanning .tsx/.ts files for banned patterns.

  ERRORS (exit 1 if any found):
    console\.log — use Logger from base_monitoring
    \bfetch\( — use base_api client
    <button[ >] — use BaseButton
    <input[ >] — use BaseInput
    <select[ >] — use BaseSelect
    new SupabaseClient\( — use createBrowserApiClient / createServerApiClient from base_api
    from '@supabase/supabase-js' — Supabase must only be imported inside base_api and base_auth packages

  WARNINGS (exit 0 with message):
    #[0-9a-fA-F]{6} in className — hardcoded hex colour, use CSS variable token
    style={{ — inline style, prefer Tailwind tokens

  Exclude from scanning: node_modules/, packages/base_api/, packages/base_auth/
  (those packages legitimately use Supabase directly — the rule is for app code)

### Documentation:

Root README.md:
- What web-base is (2 sentences)
- Relationship to app-base (same Supabase backend, same naming conventions)
- Package list with one-line descriptions
- Prerequisites
- Getting started: pnpm install, pnpm turbo dev
- How a new app consumes packages (package.json example)
- How to run tests: pnpm turbo test
- Type generation: supabase gen types typescript --project-id <ref> > lib/database.types.ts

Each package (packages/*/README.md):
- Purpose (one paragraph)
- Installation snippet
- Quick start code example
- Key exports list

CONTRIBUTING.md:
- How to add a new package
- Testing requirements: unit tests for all exports, MSW for Supabase calls, renderWithBrand for components
- Commit convention: feat:, fix:, refactor:, docs:, test:, chore:
- PR process: CI must pass, one logical change per PR

### Final quality pass:
- pnpm turbo typecheck — zero TypeScript errors
- pnpm turbo lint — zero ESLint warnings
- pnpm turbo test — all green
- pnpm turbo build — builds successfully
- Every package has: package.json, tsconfig.json, src/index.ts, README.md, at least one test file
- example_app builds: pnpm --filter example_app build

Commit: "docs: CI, compliance check, documentation, contributing guide"
```

---

## After All Prompts Complete

You now have a working web platform scaffold. To build a new web app:

1. Create a Next.js project: `npx create-next-app@latest my-app --typescript --tailwind --app`
2. Add web-base dependencies to `package.json` (only the packages you need)
3. Run `supabase gen types typescript` to get full type safety on all queries
4. Write a 20-line `AppBrand` config
5. Wrap your app in `BrandProvider + AuthProvider + ApiQueryProvider`
6. Build pages using `base_ui` components — never raw HTML elements
7. Fetch data in Server Components with `createServerApiClient`, in Client Components with `useApiQuery`
8. Ship with auth, data fetching, error handling, monitoring — all handled

For an app that also has a Flutter counterpart (using app-base), the Supabase backend is shared — same database, same Edge Functions, same auth. No backend changes needed.

---

## Troubleshooting

**"pnpm install fails"** → check Node.js is 20+. Delete `node_modules` and `pnpm-lock.yaml`, re-run `pnpm install`.

**"Turborepo can't find packages"** → check `pnpm-workspace.yaml` lists `packages/*` and `example_app`. Check each package `package.json` has the correct `name` field.

**"TypeScript errors on import"** → check `tsconfig.json` in consuming package has `"references"` pointing to the dependency. Check the dependency's `package.json` has `"main"` and `"types"` fields.

**"Supabase auth not working in App Router"** → must use `@supabase/ssr`, not `@supabase/supabase-js` directly. Cookies must pass through server components. Check middleware calls `updateSession`.

**"CSS variables not applying"** → check `BrandProvider` is at the root above the component. Check `createTailwindConfig` is in `tailwind.config.ts`.

**"Tests failing with 'window is not defined'"** → add `environment: 'jsdom'` to `vitest.config.ts`. Guard `localStorage` access with `typeof window !== 'undefined'`.

**"MSW not intercepting Supabase calls"** → MSW must be set up before tests run: `server.listen()` in beforeAll, `server.resetHandlers()` in afterEach, `server.close()` in afterAll.

**"supabase gen types gives 'project not found'"** → run `supabase login` first, then `supabase gen types typescript --project-id <your-ref>`. Find your ref in the Supabase dashboard URL.
