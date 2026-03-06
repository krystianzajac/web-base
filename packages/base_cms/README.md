# @web-base/base-cms

CMS content service that reads from the shared `cms_content` Supabase table — the same table used by the Flutter app-base. Provides a `useCms` hook and `CmsText`/`CmsImage` components that handle loading states, locale switching, and a localStorage cache with TTL for offline resilience.

## Installation

```json
{
  "dependencies": {
    "@web-base/base-cms": "github:krystianzajac/web-base#main&path=packages/base_cms"
  }
}
```

Add to `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-cms']
```

## Quick start

```tsx
// app/layout.tsx
import { CmsProvider } from '@web-base/base-cms'
import { createBrowserApiClient } from '@web-base/base-api'

const cmsConfig = {
  appId: 'my-app',
  defaultLocale: 'en',
  cacheTtlMs: 5 * 60 * 1000,  // 5 minutes
}

export default function RootLayout({ children }) {
  const client = createBrowserApiClient(apiConfig)
  return (
    <CmsProvider config={cmsConfig} apiClient={client}>
      {children}
    </CmsProvider>
  )
}

// Any component — string content
import { CmsText } from '@web-base/base-cms'

export function Hero() {
  return (
    <CmsText
      cmsKey="home.headline"
      locale="en"
      fallback="Welcome"
      as="h1"
    />
  )
}

// Any component — image content
import { CmsImage } from '@web-base/base-cms'

export function Logo() {
  return (
    <CmsImage
      cmsKey="brand.logo"
      locale="en"
      alt="Brand logo"
      width={120}
      height={40}
    />
  )
}

// Hook for custom rendering
import { useCms } from '@web-base/base-cms'

export function Tagline() {
  const { content, loading, error } = useCms('home.tagline', 'en')
  if (loading) return <span>...</span>
  return <p>{content ?? 'Default tagline'}</p>
}
```

## CMS table schema

```sql
create table cms_content (
  app_id      text not null,
  key         text not null,
  locale      text not null default 'en',
  content_json jsonb not null,
  updated_at  timestamptz default now(),
  primary key (app_id, key, locale)
);
```

`content_json` holds either a string (`"Hello"`) or a structured object for rich content.

## Key exports

| Export | Description |
|---|---|
| `CmsProvider` | Context provider — requires `config` and `apiClient` |
| `useCms(key, locale)` | `{ content: string \| null, loading, error }` |
| `useCmsJson<T>(key, locale)` | `{ content: T \| null, loading, error }` — for structured JSON content |
| `CmsText` | Locale-aware text component with loading/error state and `as` prop |
| `CmsImage` | Locale-aware image from CMS using `next/image` |
| `CmsConfig` | Config type |
| `CmsEntry` | Raw CMS row type |
| `CmsQueryClient` | Duck-typed interface for the Supabase client — use for testing |
