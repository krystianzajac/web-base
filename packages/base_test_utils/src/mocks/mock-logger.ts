import { vi } from 'vitest'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface MockLoggerInstance {
  info: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  debug: ReturnType<typeof vi.fn>
  /** Returns all recorded calls at the given log level. */
  getCallsFor(level: LogLevel): unknown[][]
}

/**
 * Creates a mock logger that captures all log calls by level.
 * Useful for asserting that specific messages were (or were not) logged.
 *
 * @example
 * ```ts
 * const logger = createMockLogger()
 * vi.mock('@web-base/base-monitoring', () => ({ Logger: logger }))
 * // ...
 * expect(logger.info).toHaveBeenCalledWith('user signed in', expect.any(Object))
 * expect(logger.getCallsFor('error')).toHaveLength(0)
 * ```
 */
export function createMockLogger(): MockLoggerInstance {
  const info = vi.fn()
  const warn = vi.fn()
  const error = vi.fn()
  const debug = vi.fn()

  return {
    info,
    warn,
    error,
    debug,
    getCallsFor(level: LogLevel): unknown[][] {
      return { info, warn, error, debug }[level].mock.calls
    },
  }
}
