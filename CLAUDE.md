# Web Base — Shared Web Scaffold

## Repo Boundaries — HARD RULE

This repo is self-contained. NEVER read, modify, or reference files outside
this repository. Do NOT modify any Watergate repos (`watergate-web-base`,
`watergate-app-base`, `watergate-web-dashboard`, or any other `watergate-*` repo).
Do NOT add external paths (e.g. `../some-other-project`) to `pnpm-workspace.yaml`
or any workspace/build config. If an app agent needs base package changes, they
must document the request — not modify this repo directly.

---

## What This Is

A TypeScript monorepo containing **shared packages** that any web application can import. This is NOT an app — it's the foundation layer. Individual web apps live in their own separate repos and pull in these packages as npm dependencies.

This is the web counterpart to **app-base** (Flutter/Dart). The philosophy is identical; the implementation is TypeScript/React. See [app-base](https://github.com/krystianzajac/app-base) for the mobile equivalent.

---

## Architecture

### Package Structure

```
web-base/
├── packages/
│   ├── base_ui/          # Component library (shadcn/ui + brand tokens + Tailwind)
│   ├── base_auth/        # Supabase Auth hooks (sign in, sign up, SSO, 2FA, session)
│   ├── base_api/         # Fetch wrapper, typed responses, error handling, retry
│   ├── base_cms/         # CMS content service (same Supabase table as app-base)
│   ├── base_monitoring/  # Sentry, analytics, structured logging
│   ├── base_i18n/        # Localisation, translations, RTL, unit switching
│   └── base_test_utils/  # Shared mocks, render helpers, test data generators
├── example_app/          # Next.js app demonstrating all packages
├── turbo.json
└── CLAUDE.md
```

### How Apps Consume Packages

Each app is a **separate repo**. It imports only the packages it needs:

```json
{
  "dependencies": {
    "@krystianzajac/base-ui": "github:krystianzajac/web-base#main&path=packages/base_ui",
    "@krystianzajac/base-auth": "github:krystianzajac/web-base#main&path=packages/base_auth"
  }
}
```

Import only what you need. A read-only CMS site doesn't need `base_auth`.

### Backend

**Same Supabase project as app-base.** Web apps use the same database, same Edge Functions, same RLS policies. This is the key architectural advantage — the backend is platform-agnostic.

Use `@supabase/ssr` (not `@supabase/supabase-js`) for Next.js App Router compatibility. All Supabase access goes through `base_api` — apps never call Supabase directly.

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js** (App Router) | Industry standard, SSR/SSG, file-based routing |
| Language | **TypeScript** | Type safety, matches app-base philosophy |
| UI components | **shadcn/ui** + **Tailwind CSS** | Unstyled primitives + utility CSS, fully customisable |
| State management | **Zustand** | Lightweight, simple, no boilerplate |
| Server state | **TanStack Query** | Data fetching, caching, offline support |
| Backend | **Supabase** (same as app-base) | Same database, same Edge Functions, same auth |
| Auth | **Supabase Auth** via `@supabase/ssr` | SSR-compatible auth |
| Monorepo | **Turborepo** | Standard TypeScript monorepo tooling |
| Testing | **Vitest** + **React Testing Library** | Fast, modern, no Jest config overhead |
| Linting | **ESLint** + **Prettier** | Standard TypeScript toolchain |
| Monitoring | **Sentry** | Same as app-base |

---

## Package Reference

### base_ui
- `AppBrand` config object — same concept as app-base, drives all tokens
- Tailwind config generator from `AppBrand`
- Components: `BaseButton`, `BaseInput`, `BaseCard`, `BaseDialog`, `BaseToast`, `BaseToggle`, `BaseSelect`, `BaseBadge`, `BaseAvatar`, `BaseSpinner`, `BaseSkeleton`, `BaseAlert`
- All components consume brand tokens — no hardcoded colours or spacing
- Dark mode via CSS variables, auto-derived from brand config
- RTL support via Tailwind's `rtl:` variant
- WCAG 2.1 AA enforced (contrast ratios, focus rings, ARIA labels)

### base_auth
- `useAuth()` hook — current user, sign in, sign up, sign out, loading state
- `useSession()` hook — session token, expiry, refresh
- SSO: Google, Apple, GitHub (configurable per app)
- 2FA: TOTP enroll/verify
- Server-side auth helpers for Next.js App Router (middleware, server components)
- Supabase Auth is wrapped — no Supabase types leak into the public API

### base_api
- `createClient()` — typed Supabase client with auth token auto-attachment
- `useQuery()` / `useMutation()` wrappers with standard error handling
- Typed error hierarchy: `NetworkError`, `AuthError`, `NotFoundError`, `ServerError` (mirrors app-base)
- `ErrorMessageMapper` — maps errors to i18n keys
- Retry with exponential backoff
- All API calls go through this package — no direct `fetch()` or Supabase client in app code

### base_cms
- `useCms(key, locale)` hook — fetch CMS content, cache, offline fallback
- `CmsText` component — locale-aware text from CMS with loading/error state
- `CmsImage` component — image from CMS with fallback
- Reads from the same `cms_content` Supabase table as the Flutter app
- Cache in localStorage with TTL

### base_monitoring
- `initMonitoring(config)` — Sentry init, environment config
- `Logger` — structured logging: `Logger.info()`, `.warn()`, `.error()`
- `Analytics` — privacy-respecting event tracking (consent-gated)
- `<ErrorBoundary fallback={...}>` component

### base_i18n
- `LocaleProvider` — context provider; persists locale to localStorage, sets `lang`/`dir` on `<html>`
- `useLocale()` hook — `{ locale, setLocale, dir, isRTL }`
- Supported locales: `en`, `pl`, `ja`, `zh`, `ar` — Arabic auto-enables RTL
- `useTranslations(map)` hook — type-safe `t(key)` with automatic English fallback
- `LocaleSwitcher` component — `<select>` showing each language in its own script
- `UnitsProvider` — context provider; persists unit system to localStorage
- `useUnits()` hook — `{ unitSystem, setUnitSystem, convert, toMetric, format, label }`
- Unit systems: `metric` (bar, L/min, L, °C) / `imperial` (PSI, GPM, gal, °F)
- `formatUnit(value, quantity, system)` — pure conversion + label (no React required)

### base_test_utils
- `renderWithBrand(component, brand)` — wraps in providers (theme, query client, router)
- Mock factories: `MockAuthService`, `MockApiClient`, `MockCmsService`
- `TestData` generators: `TestData.user()`, `TestData.profile()`
- `TestBrands` — pre-built brand configs for testing

---

## Key Principles

1. **Never use raw HTML elements for interactive UI** — use `base_ui` components
2. **Never call `fetch()` or Supabase directly** — use `base_api`
3. **Never hardcode colours or spacing** — use Tailwind tokens from `AppBrand`
4. **No `console.log()`** — use `Logger` from `base_monitoring`
5. **All components must have ARIA labels** — accessibility is non-negotiable
6. **No secrets in source control** — use environment variables

### Banned Patterns

```tsx
// BANNED
<button className="bg-blue-500 rounded-full px-4">Submit</button>
fetch('/api/data')
supabase.from('profiles').select()
console.log('debug')

// CORRECT
<BaseButton variant="primary">Submit</BaseButton>
const data = await api.query('table', filters)
const data = await api.query('profiles', filters)
Logger.info('debug message')
```

---

## Brand Configuration

Every app provides a brand config. This is the only thing that changes between apps:

```tsx
const brand: AppBrand = {
  name: 'My App',
  primaryColor: '#6C63FF',
  secondaryColor: '#2D2D2D',
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FFA726',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  logo: '/assets/logo.svg',
  spacing: 'standard',   // or 'compact'
  radius: 'medium',      // or 'sharp', 'rounded'
}
```

---

## Quick Start (New App)

1. Create a Next.js project: `npx create-next-app@latest my-app --typescript --tailwind --app`
2. Add web-base dependencies to `package.json`
3. Write a brand config (20 lines)
4. Wrap your app in `<BrandProvider brand={brand}>`
5. Build pages using `base_ui` components
6. Ship with: auth, data fetching, error handling, monitoring — all handled

---

## Example App

`example_app/` demonstrates:
- Brand configuration
- Auth flow (sign in, sign up, SSO, sign out)
- Data fetching via `base_api`
- CMS content via `base_cms`
- Dark mode toggle
- Language switcher (EN, PL, JA, ZH, AR — Arabic triggers RTL)
- Unit system switcher (metric / imperial)
- RTL preview
- Error boundaries
- Monitoring + analytics

Build the example app alongside each package — not after. It's the best proof everything works.

---

## Development Standards

### Code Quality
- All public APIs must have JSDoc comments
- Every package must have unit tests (minimum 80% coverage on business logic)
- `tsc --noEmit` must pass with zero errors
- `eslint` must pass with zero warnings
- `prettier --check` must pass
- No `console.log()` — use `Logger` from `base_monitoring`

### Git Discipline
- One logical change = one commit
- Commit immediately after completing each change
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

### Package Versioning
- Semantic versioning (MAJOR.MINOR.PATCH)
- All packages start at 0.1.0
- Breaking changes = major bump

### Security Standards
- No secrets in source control — ever
- All network calls via `base_api`
- All user input sanitised before storage
- Principle of least privilege on all RLS policies

---

## Build Order

Build packages in this order — each one unblocks the next:

1. `base_ui` — components needed in every screen
2. `base_auth` — auth needed before any real app screen
3. `base_api` — data layer needed for real content
4. `base_monitoring` — should be in from the start
5. `base_cms` — content service
6. `base_i18n` — localisation, RTL, unit switching
7. `base_test_utils` — add alongside each package, not at the end

Build `example_app` incrementally as each package is completed.

---

## Relationship with app-base

- **Same Supabase backend** — same database, same Edge Functions, same RLS
- **Same naming conventions** — `base_ui`, `base_auth`, `base_api` mirror `base_ui_kit`, `base_core`, `base_api_gateway`
- **Same philosophy** — modular, app-agnostic, enforced, configurable via brand/config objects
- **Design tokens** — deferred until a product needs the same brand on both mobile and web simultaneously. If that occurs, add `app-base/design-tokens/` and consume from both platforms.

---

*Build for the long term. Every decision should make the 10th app as easy to build as the 2nd.*
