# @web-base/base-test-utils

Shared test infrastructure for web-base applications. Provides `renderWithBrand` (wraps components in the full provider stack), MSW-based Supabase mock handlers, mock service factories, and `TestData` generators — so test files stay short and free of boilerplate.

**devDependency only** — never import this package in production code.

## Installation

```json
{
  "devDependencies": {
    "@web-base/base-test-utils": "github:krystianzajac/web-base#main&path=packages/base_test_utils"
  }
}
```

## Quick start

### Rendering components

```tsx
import { renderWithBrand, TestBrands, createMockAuthService } from '@web-base/base-test-utils'
import { screen } from '@testing-library/react'
import MyComponent from './MyComponent'

it('renders for a signed-in user', () => {
  const user = { id: 'u1', email: 'alice@example.com', displayName: 'Alice' }
  renderWithBrand(<MyComponent />, {
    brand: TestBrands.plain,
    authState: createMockAuthService({ user }),
  })
  expect(screen.getByText('Alice')).toBeInTheDocument()
})
```

### Mocking Supabase API calls

```ts
import {
  createSupabaseMockHandlers,
  createMockServer,
  TestData,
} from '@web-base/base-test-utils'

const profile = TestData.user()

// Sets up beforeAll / afterEach / afterAll automatically
const server = createMockServer(
  ...createSupabaseMockHandlers('profiles', { rows: [profile] }),
)

it('fetches profiles', async () => {
  // MSW intercepts the Supabase REST call
  await waitFor(() =>
    expect(screen.getByText(profile.display_name)).toBeInTheDocument()
  )
})
```

### Mocking Logger and Analytics

```ts
import { createMockLogger, createMockAnalytics } from '@web-base/base-test-utils'

it('logs on error', () => {
  const logger = createMockLogger()
  // inject logger into component...
  expect(logger.getCallsFor('error')).toHaveLength(1)
})
```

## Key exports

### Render

| Export | Description |
|---|---|
| `renderWithBrand(ui, options?)` | Renders with `BrandProvider → AuthContext → ApiQueryProvider → CmsProvider` |
| `RenderWithBrandOptions` | `{ brand?, queryClient?, authState? }` |

### Mocks

| Export | Description |
|---|---|
| `createMockAuthService(overrides?)` | Returns a full `AuthContextValue` with `vi.fn()` stubs |
| `createSupabaseMockHandlers(table, options?, url?)` | MSW handlers for GET / POST / PATCH / DELETE on a Supabase table |
| `createMockServer(...handlers)` | `setupServer` + auto-registers `beforeAll/afterEach/afterAll` |
| `createMockCmsHandlers(appId, content, url?)` | MSW handlers for `cms_content` table |
| `createMockCmsHook(content)` | Drop-in replacement for `useCms` returning static content |
| `createMockLogger()` | `{ info, warn, error, debug, getCallsFor(level) }` |
| `createMockAnalytics()` | `{ events[], wasEventFired(name) }` |

### Data

| Export | Description |
|---|---|
| `TestData.user(overrides?)` | Random user with `crypto.randomUUID()` id |
| `TestData.session(overrides?)` | Random session |
| `TestData.cmsEntry(overrides?)` | Random CMS entry |
| `TestBrands.plain` | Hot-pink brand for visual tests |
| `TestBrands.dark` | Dark-mode brand |
| `TestBrands.compact` | Compact spacing brand |
