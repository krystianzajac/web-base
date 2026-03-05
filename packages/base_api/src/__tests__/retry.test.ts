import { describe, it, expect, vi } from 'vitest'
import { withRetry } from '../utils/retry'
import { NetworkError, AuthError, ServerError } from '../errors/api-error'

describe('withRetry', () => {
  it('returns result immediately when fn succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, { attempts: 3, delayMs: 0 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on NetworkError and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('timeout'))
      .mockResolvedValueOnce('recovered')

    const result = await withRetry(fn, { attempts: 3, delayMs: 0 })
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries on ServerError and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ServerError('503'))
      .mockResolvedValueOnce('ok')

    const result = await withRetry(fn, { attempts: 3, delayMs: 0 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('does NOT retry on AuthError (non-retryable)', async () => {
    const fn = vi.fn().mockRejectedValue(new AuthError('not authed'))
    await expect(withRetry(fn, { attempts: 3, delayMs: 0 })).rejects.toBeInstanceOf(AuthError)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('exhausts all retries and throws the last error', async () => {
    const fn = vi.fn().mockRejectedValue(new NetworkError('down'))
    await expect(withRetry(fn, { attempts: 3, delayMs: 0 })).rejects.toBeInstanceOf(NetworkError)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('classifies plain errors before checking retryable', async () => {
    // A plain Error with "network" in message should be classified as NetworkError and retried
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('network unreachable'))
      .mockResolvedValueOnce('ok')

    const result = await withRetry(fn, { attempts: 3, delayMs: 0 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
