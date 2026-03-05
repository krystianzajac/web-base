import * as Sentry from '@sentry/nextjs'

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Structured logger. Use this everywhere instead of console.log.
 *
 * - In production: routes info/warn/debug to Sentry breadcrumbs; error → Sentry.captureException
 * - In development: structured console output with level prefix
 */
export class Logger {
  static info(message: string, data?: Record<string, unknown>): void {
    if (isProd()) {
      Sentry.addBreadcrumb({ message, data, level: 'info' })
    } else {
      // eslint-disable-next-line no-console
      console.info('[INFO]', message, ...(data ? [data] : []))
    }
  }

  static warn(message: string, data?: Record<string, unknown>): void {
    if (isProd()) {
      Sentry.addBreadcrumb({ message, data, level: 'warning' })
    } else {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', message, ...(data ? [data] : []))
    }
  }

  /**
   * Logs an error. In production, captures it as a Sentry exception.
   *
   * @param message - Human-readable description of what went wrong
   * @param error   - The caught Error instance (optional but strongly recommended)
   * @param data    - Additional structured context
   */
  static error(message: string, error?: Error, data?: Record<string, unknown>): void {
    if (isProd()) {
      const exception = error ?? new Error(message)
      Sentry.captureException(exception, { extra: { message, ...data } })
    } else {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', message, ...(error ? [error] : []), ...(data ? [data] : []))
    }
  }

  static debug(message: string, data?: Record<string, unknown>): void {
    if (isProd()) {
      Sentry.addBreadcrumb({ message, data, level: 'debug' })
    } else {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', message, ...(data ? [data] : []))
    }
  }
}
