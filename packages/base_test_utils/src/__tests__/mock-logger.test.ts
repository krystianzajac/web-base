import { describe, it, expect } from 'vitest'
import { createMockLogger } from '../mocks/mock-logger'

describe('createMockLogger', () => {
  it('captures info calls', () => {
    const logger = createMockLogger()
    logger.info('hello', { key: 'value' })
    expect(logger.info).toHaveBeenCalledWith('hello', { key: 'value' })
  })

  it('captures warn calls', () => {
    const logger = createMockLogger()
    logger.warn('something looks off')
    expect(logger.warn).toHaveBeenCalledOnce()
  })

  it('captures error calls', () => {
    const logger = createMockLogger()
    const err = new Error('boom')
    logger.error('it broke', err)
    expect(logger.error).toHaveBeenCalledWith('it broke', err)
  })

  it('captures debug calls', () => {
    const logger = createMockLogger()
    logger.debug('verbose')
    expect(logger.debug).toHaveBeenCalledWith('verbose')
  })

  it('getCallsFor returns calls at the correct level', () => {
    const logger = createMockLogger()
    logger.info('first')
    logger.info('second')
    logger.warn('a warning')

    expect(logger.getCallsFor('info')).toHaveLength(2)
    expect(logger.getCallsFor('warn')).toHaveLength(1)
    expect(logger.getCallsFor('error')).toHaveLength(0)
  })

  it('each createMockLogger() is independent', () => {
    const loggerA = createMockLogger()
    const loggerB = createMockLogger()
    loggerA.info('only in A')
    expect(loggerA.info).toHaveBeenCalledOnce()
    expect(loggerB.info).not.toHaveBeenCalled()
  })
})
