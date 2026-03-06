# Contributing to web-base

## Adding a new package

1. Create the directory: `packages/base_<name>/`
2. Add the required files (see checklist below)
3. Add it to the root `pnpm-workspace.yaml` if not already glob-matched
4. Add it to `transpilePackages` in `example_app/next.config.mjs`
5. Demonstrate its usage in `example_app/`

### New package checklist

```
packages/base_<name>/
├── package.json          name: "@web-base/base-<name>", main/types: "./src/index.ts"
├── tsconfig.json         extends ../../tsconfig.base.json
├── src/
│   └── index.ts          re-exports every public symbol
└── README.md             purpose, installation, quick start, key exports
```

`package.json` minimum:

```json
{
  "name": "@web-base/base-<name>",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc --noEmit",
    "test": "vitest run --reporter=verbose",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit"
  }
}
```

## Testing requirements

### All exports must have unit tests

- Business logic: direct unit tests
- React components: use `renderWithBrand` from `@web-base/base-test-utils`
- Supabase calls: intercept with `createSupabaseMockHandlers` + MSW — never hit a real database
- Target: ≥ 80% coverage on non-trivial logic

### Example test structure

```tsx
// packages/base_<name>/src/__tests__/my-component.test.tsx
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithBrand, TestBrands } from '@web-base/base-test-utils'
import { MyComponent } from '../components/my-component'

describe('MyComponent', () => {
  it('renders with brand tokens', () => {
    renderWithBrand(<MyComponent />, { brand: TestBrands.plain })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

```ts
// packages/base_<name>/src/__tests__/my-service.test.ts
import { describe, it, expect } from 'vitest'
import { createMockServer, createSupabaseMockHandlers } from '@web-base/base-test-utils'

createMockServer(
  ...createSupabaseMockHandlers('my_table', { rows: [{ id: '1', name: 'Test' }] }),
)

describe('myService', () => {
  it('fetches rows', async () => {
    const result = await myService.getAll()
    expect(result).toHaveLength(1)
  })
})
```

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature or export |
| `fix:` | Bug fix |
| `refactor:` | Code change with no behaviour change |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, CI, dependency updates |

One logical change per commit. Examples:

```
feat: base_ui — add BaseDrawer component
fix: base_api — retry on 503 in addition to 500
refactor: base_cms — extract cache TTL logic into helper
test: base_auth — add MFA enroll/verify integration tests
docs: base_monitoring — document Analytics.consent API
chore: bump pnpm to 9.15.0
```

## PR process

1. **CI must be green** — all five jobs (typecheck, lint, test, build, compliance) must pass
2. **One logical change per PR** — split unrelated changes into separate PRs
3. **Update the relevant README** if you add or change public exports
4. **Add/update tests** — PRs that reduce test coverage will be asked to add tests
5. **No secrets** — never commit `.env` files, API keys, or credentials

### What CI checks

- `typecheck` — `tsc --noEmit` zero errors across all packages
- `lint` — ESLint zero warnings (`--max-warnings 0`)
- `test` — all Vitest suites pass; coverage uploaded as artifact
- `build` — `next build` succeeds for `example_app`
- `compliance` — `ci/check_compliance.sh` scans for banned patterns:
  - `console.log` (use `Logger`)
  - raw `fetch()` (use `base_api` client)
  - `<button>`, `<input>`, `<select>` (use `base_ui` components)
  - `new SupabaseClient()` or `from '@supabase/supabase-js'` in app code

## Key principles (from CLAUDE.md)

- **Never use raw HTML for interactive UI** — use `base_ui` components
- **Never call `fetch()` or Supabase directly** — use `base_api`
- **Never hardcode colours or spacing** — use Tailwind tokens from `AppBrand`
- **No `console.log()`** — use `Logger` from `base_monitoring`
- **All components must have ARIA labels** — accessibility is non-negotiable
- **No secrets in source control** — use environment variables
