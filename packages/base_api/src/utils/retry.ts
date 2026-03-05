import { normaliseError, isRetryable } from '../errors/normalise-error'
import type { ApiError } from '../errors/api-error'

interface RetryOptions {
  attempts: number
  delayMs: number
}

/**
 * Runs `fn` with exponential backoff, retrying only on NetworkError and ServerError.
 * Useful for arbitrary async operations outside of Supabase query builders.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, delayMs } = options
  let lastError: ApiError

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = normaliseError(err)
      if (!isRetryable(lastError) || attempt === attempts - 1) {
        throw lastError
      }
      await sleep(delayMs * Math.pow(2, attempt))
    }
  }

  throw lastError!
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
