/**
 * Next.js instrumentation hook — runs once at server startup.
 * Initialises Sentry monitoring if NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  const { initMonitoring } = await import('@web-base/base-monitoring')
  initMonitoring({
    dsn,
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}
