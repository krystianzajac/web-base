import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startSpan: vi.fn(async (_opts: unknown, fn: (span: any) => unknown) => fn({})),
}))

import * as Sentry from '@sentry/nextjs'
import { PerformanceTracer } from '../tracing/performance-tracer'

describe('PerformanceTracer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startTrace / endTrace', () => {
    it('startTrace returns a Trace with the given name and a startTime', () => {
      const trace = PerformanceTracer.startTrace('my-operation')
      expect(trace.name).toBe('my-operation')
      expect(typeof trace.startTime).toBe('number')
    })

    it('endTrace does not throw', () => {
      const trace = PerformanceTracer.startTrace('op')
      expect(() => PerformanceTracer.endTrace(trace)).not.toThrow()
    })
  })

  describe('withTrace', () => {
    it('resolves with the value returned by the wrapped fn', async () => {
      const result = await PerformanceTracer.withTrace('fetch-data', async () => 'payload')
      expect(result).toBe('payload')
    })

    it('calls Sentry.startSpan with the operation name', async () => {
      await PerformanceTracer.withTrace('my-span', async () => 42)
      expect(Sentry.startSpan).toHaveBeenCalledWith({ name: 'my-span' }, expect.any(Function))
    })

    it('propagates errors thrown inside the fn', async () => {
      // Override mock to actually invoke fn so the error propagates
      vi.mocked(Sentry.startSpan).mockImplementationOnce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (_opts: unknown, fn: (span: any) => unknown) => fn({}),
      )
      await expect(
        PerformanceTracer.withTrace('fail-span', async () => {
          throw new Error('inner error')
        }),
      ).rejects.toThrow('inner error')
    })
  })
})
