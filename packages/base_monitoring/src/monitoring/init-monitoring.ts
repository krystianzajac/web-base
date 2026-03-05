import * as Sentry from '@sentry/nextjs'
import type { MonitoringConfig } from '../types/monitoring-config'

/**
 * Initialises Sentry monitoring. Call this once in instrumentation.ts at app startup.
 *
 * @example
 * ```ts
 * // instrumentation.ts
 * export async function register() {
 *   initMonitoring({
 *     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
 *     environment: 'prod',
 *     release: process.env.NEXT_PUBLIC_APP_VERSION,
 *   })
 * }
 * ```
 */
export function initMonitoring(config: MonitoringConfig): void {
  const tracesSampleRate =
    config.tracesSampleRate ?? (config.environment === 'prod' ? 0.1 : 1.0)

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    tracesSampleRate,
    debug: config.debug ?? false,
  })
}
