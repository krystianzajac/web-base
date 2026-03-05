import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startSpan: vi.fn(async (_opts: unknown, fn: (span: any) => unknown) => fn({})),
}))

import * as Sentry from '@sentry/nextjs'
import { Logger } from '../logging/logger'

describe('Logger — production mode', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('Logger.info calls Sentry.addBreadcrumb with level info', () => {
    Logger.info('hello', { foo: 'bar' })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: 'hello',
      data: { foo: 'bar' },
      level: 'info',
    })
  })

  it('Logger.warn calls Sentry.addBreadcrumb with level warning', () => {
    Logger.warn('watch out')

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: 'watch out',
      data: undefined,
      level: 'warning',
    })
  })

  it('Logger.debug calls Sentry.addBreadcrumb with level debug', () => {
    Logger.debug('trace point', { step: 1 })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: 'trace point',
      data: { step: 1 },
      level: 'debug',
    })
  })

  it('Logger.error calls Sentry.captureException with the provided Error', () => {
    const err = new Error('boom')
    Logger.error('it broke', err, { context: 'test' })

    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      extra: { message: 'it broke', context: 'test' },
    })
  })

  it('Logger.error wraps a string message in a new Error when no error object given', () => {
    Logger.error('no error object')

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ message: 'no error object' }) }),
    )
  })

  it('Logger does not produce console output in prod', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    Logger.info('silent in prod')
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('Logger — development mode', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('Logger.info writes to console.info in dev', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    Logger.info('dev message')
    expect(spy).toHaveBeenCalledWith('[INFO]', 'dev message')
    spy.mockRestore()
  })

  it('Logger.warn writes to console.warn in dev', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    Logger.warn('dev warning')
    expect(spy).toHaveBeenCalledWith('[WARN]', 'dev warning')
    spy.mockRestore()
  })

  it('Logger.error writes to console.error in dev', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const err = new Error('dev error')
    Logger.error('broke in dev', err)
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'broke in dev', err)
    spy.mockRestore()
  })

  it('Logger.debug writes to console.debug in dev', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    Logger.debug('dev debug')
    expect(spy).toHaveBeenCalledWith('[DEBUG]', 'dev debug')
    spy.mockRestore()
  })

  it('Sentry.addBreadcrumb is NOT called in dev', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    Logger.info('no sentry in dev')
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
