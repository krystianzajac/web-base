import { classifyError, isRetryable } from '../errors/error-classifier'
import type { ApiError } from '../errors/api-error'

interface RetryOptions {
  attempts: number
  delayMs: number
}

/**
 * Runs `fn`, retrying on retryable errors with exponential backoff.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, delayMs } = options
  let lastError: ApiError

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = classifyError(err)
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
