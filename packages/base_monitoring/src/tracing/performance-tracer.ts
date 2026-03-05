import * as Sentry from '@sentry/nextjs'

export interface Trace {
  name: string
  startTime: number
}

/**
 * Lightweight performance tracing wrapper around Sentry spans.
 *
 * For simple one-shot wrapping prefer `withTrace`. `startTrace`/`endTrace`
 * are provided for cases where start and end are in different call sites.
 *
 * @example
 * ```ts
 * const result = await PerformanceTracer.withTrace('load-profile', async () => {
 *   return client.from('profiles').select('*').single()
 * })
 * ```
 */
export const PerformanceTracer = {
  /**
   * Marks the start of a trace. Call `endTrace` when the operation completes.
   * For fully async operations, prefer `withTrace` instead.
   */
  startTrace(name: string): Trace {
    return { name, startTime: Date.now() }
  },

  /**
   * Marks the end of a trace started with `startTrace`.
   * Currently records duration — extend to emit Sentry spans if needed.
   */
  endTrace(_trace: Trace): void {
    // Duration could be logged here if needed:
    // const duration = Date.now() - trace.startTime
  },

  /**
   * Wraps an async operation in a Sentry span and returns its result.
   * This is the preferred tracing method for async operations.
   */
  async withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return Sentry.startSpan({ name }, () => fn())
  },
}
