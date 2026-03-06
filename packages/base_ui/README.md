# @web-base/base-ui

Component library and design system for web-base applications. Built on shadcn/ui primitives and Tailwind CSS, every component consumes brand tokens from an `AppBrand` config — no hardcoded colours or spacing anywhere. Supports dark mode via CSS variables, RTL layouts via Tailwind's `rtl:` variant, and enforces WCAG 2.1 AA contrast ratios throughout.

## Installation

```json
{
  "dependencies": {
    "@web-base/base-ui": "github:krystianzajac/web-base#main&path=packages/base_ui"
  }
}
```

Add to `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-ui']
```

## Quick start

```tsx
// 1. Define your brand (once, per app)
import type { AppBrand } from '@web-base/base-ui'

const brand: AppBrand = {
  name: 'My App',
  primaryColor: '#6C63FF',
  secondaryColor: '#2D2D2D',
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FFA726',
  fonts: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
  logo: '/assets/logo.svg',
  spacing: 'standard',
  radius: 'medium',
}

// 2. Wrap your app
import { BrandProvider } from '@web-base/base-ui'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BrandProvider brand={brand}>{children}</BrandProvider>
      </body>
    </html>
  )
}

// 3. Use components
import { BaseButton, BaseInput, BaseCard } from '@web-base/base-ui'

function LoginForm() {
  return (
    <BaseCard padding="lg">
      <BaseInput label="Email" type="email" aria-label="Email address" />
      <BaseButton variant="primary">Sign In</BaseButton>
    </BaseCard>
  )
}
```

## Tailwind config

Import the config generator in your `tailwind.config.ts` (use the `/tailwind` sub-path to avoid loading React components in the PostCSS context):

```ts
import { createTailwindConfig } from '@web-base/base-ui/tailwind'
import { myBrand } from './src/brand'

export default {
  ...createTailwindConfig(myBrand),
  content: ['./src/**/*.{ts,tsx}'],
}
```

## Key exports

### Theme

| Export | Description |
|---|---|
| `BrandProvider` | Context provider — injects CSS variables, manages dark mode |
| `useBrand()` | `{ brand, isDark, toggleDark }` |
| `createTailwindConfig(brand)` | Generates Tailwind config from `AppBrand` |
| `AppBrand` | Brand config type |

### Components

| Export | Description |
|---|---|
| `BaseButton` | `variant`: primary \| secondary \| destructive \| ghost; `loading` state |
| `BaseInput` | Labelled input with error state, accessible by default |
| `BaseCard` | Surface container, `padding`: sm \| md \| lg, `shadow`: none \| subtle \| medium \| strong |
| `BaseDialog` | Modal dialog (Radix Dialog) |
| `BaseToast` | Toast notifications (Radix Toast) |
| `BaseToggle` | Accessible switch with label and helper text (Radix Switch) |
| `BaseSelect` | Styled select (Radix Select) |
| `BaseBadge` | Status badge |
| `BaseAvatar` | User avatar with fallback initials (Radix Avatar) |
| `BaseSpinner` | Loading spinner with ARIA label |
| `BaseSkeleton` | Skeleton placeholder, variants: text \| circle \| rect |
| `BaseAlert` | Inline alert, `variant`: info \| success \| warning \| error |
| `ErrorBoundary` | React error boundary with ReactNode or render-prop fallback |
