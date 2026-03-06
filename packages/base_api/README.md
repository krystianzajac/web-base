# @web-base/base-api

Typed Supabase client factory, TanStack Query wrappers, structured error hierarchy, and exponential-backoff retry. The single rule: all data access in your app must go through this package — no direct `fetch()` or `supabase` calls in application code.

## Installation

```json
{
  "dependencies": {
    "@web-base/base-api": "github:krystianzajac/web-base#main&path=packages/base_api"
  }
}
```

Add to `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-api']
```

## Quick start

```tsx
// lib/config.ts
export const apiConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

// app/layout.tsx — wrap with query provider
import { ApiQueryProvider } from '@web-base/base-api'

export default function RootLayout({ children }) {
  return <ApiQueryProvider>{children}</ApiQueryProvider>
}

// Client Component — query
'use client'
import { useApiQuery, createBrowserApiClient } from '@web-base/base-api'
import type { Database } from '@/lib/database.types'

const client = createBrowserApiClient<Database>(apiConfig)

export function ProfileList() {
  const { data, loading, error } = useApiQuery(
    ['profiles'],
    () => client.from('profiles').select('*'),
  )
  if (loading) return <p>Loading...</p>
  if (error) return <p>{error.message}</p>
  return <ul>{data?.map(p => <li key={p.id}>{p.display_name}</li>)}</ul>
}

// Server Component — direct query
import { createServerApiClient } from '@web-base/base-api'

export default async function Page() {
  const client = createServerApiClient<Database>(apiConfig)
  const { data } = await client.from('profiles').select('*')
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

## Error handling

```ts
import { normaliseError, AuthError, NotFoundError, NetworkError } from '@web-base/base-api'

try {
  const { data } = await client.from('profiles').select().single()
} catch (err) {
  const apiError = normaliseError(err)
  if (apiError instanceof AuthError) redirect('/auth/signin')
  if (apiError instanceof NotFoundError) return null
  throw apiError  // let ErrorBoundary handle unexpected errors
}
```

## Key exports

| Export | Description |
|---|---|
| `createBrowserApiClient<DB>(config)` | Cookie-aware client for Client Components |
| `createServerApiClient<DB>(config)` | Cookie-aware client for Server Components |
| `createMiddlewareApiClient(request, config)` | Client for use in Next.js middleware |
| `ApiQueryProvider` | TanStack Query `QueryClientProvider` wrapper |
| `useApiQuery(key, fn, options?)` | Query hook — returns `{ data, loading, error }` |
| `useApiMutation(fn, options?)` | Mutation hook — returns `{ mutate, loading, error }` |
| `normaliseError(err)` | Converts any thrown value to a typed `ApiError` subclass |
| `isRetryable(err)` | True for `NetworkError` and `ServerError` |
| `withRetry(fn, options?)` | Wraps an async function with exponential-backoff retry |
| `ErrorMessageMapper` | Maps `ApiError` → i18n key or human-readable string |
| `ApiError`, `NetworkError`, `AuthError`, `NotFoundError`, `ServerError`, `ConflictError`, `RateLimitError` | Error hierarchy |
| `ApiConfig` | Config type |
