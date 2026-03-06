# @web-base/base-monitoring

Observability layer for web-base applications: Sentry error tracking, structured logging, consent-gated analytics, and a React error boundary. All wrapped so application code never imports Sentry or any third-party monitoring SDK directly.

## Installation

```json
{
  "dependencies": {
    "@web-base/base-monitoring": "github:krystianzajac/web-base#main&path=packages/base_monitoring"
  }
}
```

Add to `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-monitoring'],
experimental: { instrumentationHook: true },
```

## Quick start

### Sentry init (Next.js instrumentation hook)

```ts
// instrumentation.ts  (at the project root, next to package.json)
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  const { initMonitoring } = await import('@web-base/base-monitoring')
  initMonitoring({
    dsn,
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    release: process.env.NEXT_PUBLIC_APP_VERSION,
  })
}
```

### Logger

```ts
import { Logger } from '@web-base/base-monitoring'

// Structured logs — go to Sentry breadcrumbs + console in dev
Logger.info('User signed in', { userId: user.id })
Logger.warn('Cache miss', { key: 'home.headline' })
Logger.error('Payment failed', { orderId, reason })
```

### Analytics

```ts
import { Analytics } from '@web-base/base-monitoring'

// Only fires after the user has consented (consent-gated internally)
Analytics.track('button_click', { label: 'sign_in', page: '/auth/signin' })
Analytics.identify(user.id, { plan: 'free' })
Analytics.consent(true)   // call after the user accepts your cookie banner
```

### Error boundary

```tsx
import { ErrorBoundaryWithMonitoring } from '@web-base/base-monitoring'
import { BaseAlert } from '@web-base/base-ui'

export default function Page() {
  return (
    <ErrorBoundaryWithMonitoring
      fallback={
        <BaseAlert
          variant="error"
          title="Something went wrong"
          description="Our team has been notified."
        />
      }
    >
      <RiskyComponent />
    </ErrorBoundaryWithMonitoring>
  )
}
```

## Key exports

| Export | Description |
|---|---|
| `initMonitoring(config)` | Initialises Sentry — call once in `instrumentation.ts` |
| `Logger` | `Logger.info / .warn / .error / .debug(message, context?)` |
| `Analytics` | `Analytics.track / .identify / .consent(boolean)` |
| `ErrorBoundaryWithMonitoring` | Class error boundary that reports to Sentry on catch |
| `MonitoringConfig` | Config type for `initMonitoring` |
