# web-base

A TypeScript monorepo of shared packages for web applications — the web counterpart to [app-base](https://github.com/krystianzajac/app-base). Every package is framework-agnostic but optimised for Next.js App Router; all packages share the same Supabase backend as the Flutter mobile apps.

## Relationship to app-base

Both repos point at the **same Supabase project**: same database tables, same Edge Functions, same Row-Level Security policies. Naming conventions are intentionally parallel (`base_ui` ↔ `base_ui_kit`, `base_api` ↔ `base_api_gateway`). A user who signs up on mobile is immediately visible on web with no extra work.

## Packages

| Package | Description |
|---|---|
| [`base_ui`](packages/base_ui/) | Component library — shadcn/ui primitives + brand tokens + Tailwind |
| [`base_auth`](packages/base_auth/) | Supabase Auth hooks: sign in, sign up, SSO, 2FA, session management |
| [`base_api`](packages/base_api/) | Typed Supabase client, TanStack Query wrappers, error hierarchy, retry |
| [`base_cms`](packages/base_cms/) | CMS content from the shared `cms_content` table, with localStorage cache |
| [`base_monitoring`](packages/base_monitoring/) | Sentry init, structured Logger, consent-gated Analytics, ErrorBoundary |
| [`base_i18n`](packages/base_i18n/) | Localisation (EN/PL/JA/ZH/AR), RTL, `useTranslations`, metric/imperial unit switching |
| [`base_test_utils`](packages/base_test_utils/) | `renderWithBrand`, MSW handlers, mock services, TestData generators |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 — `npm install -g pnpm`
- A Supabase project (free tier is fine)

## Getting started

```bash
# Install all workspace dependencies
pnpm install

# Start all packages in watch mode + example app dev server
pnpm turbo dev
# → example app: http://localhost:3000
```

Create `example_app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...   # optional
```

## Consuming packages in a new app

Add only what you need to your app's `package.json`:

```json
{
  "dependencies": {
    "@web-base/base-ui":           "github:krystianzajac/web-base#main&path=packages/base_ui",
    "@web-base/base-auth":         "github:krystianzajac/web-base#main&path=packages/base_auth",
    "@web-base/base-api":          "github:krystianzajac/web-base#main&path=packages/base_api",
    "@web-base/base-cms":          "github:krystianzajac/web-base#main&path=packages/base_cms",
    "@web-base/base-monitoring":   "github:krystianzajac/web-base#main&path=packages/base_monitoring",
    "@web-base/base-i18n":         "github:krystianzajac/web-base#main&path=packages/base_i18n"
  },
  "devDependencies": {
    "@web-base/base-test-utils":   "github:krystianzajac/web-base#main&path=packages/base_test_utils"
  }
}
```

Add to `next.config.mjs`:

```js
const nextConfig = {
  transpilePackages: [
    '@web-base/base-ui',
    '@web-base/base-auth',
    '@web-base/base-api',
    '@web-base/base-cms',
    '@web-base/base-monitoring',
    '@web-base/base-i18n',
  ],
}
```

See [`example_app/`](example_app/) for a complete working example.

## Running tests

```bash
# All packages
pnpm turbo test

# Single package
pnpm --filter @web-base/base-ui test

# With coverage
pnpm turbo test -- --coverage
```

## Generating Supabase types

```bash
supabase gen types typescript --project-id <your-project-ref> \
  > src/lib/database.types.ts
```

Run this whenever the database schema changes and commit the result.

## CI

GitHub Actions runs on every push and pull request to `main`:

- **typecheck** — `tsc --noEmit` across all packages
- **lint** — ESLint zero warnings
- **test** — Vitest with coverage artifact
- **build** — `next build` (gated on the three above)
- **compliance** — scans app code for banned patterns (see `ci/check_compliance.sh`)

## Scripts

```bash
pnpm turbo build       # typecheck all packages + next build
pnpm turbo test        # run all test suites
pnpm turbo lint        # ESLint all packages
pnpm turbo typecheck   # tsc --noEmit all packages
```
