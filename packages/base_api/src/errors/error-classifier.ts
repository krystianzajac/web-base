import {
  ApiError,
  AuthError,
  ConflictError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  UnknownError,
} from './api-error'

/**
 * Converts an unknown thrown value into a typed ApiError subclass.
 */
export function classifyError(err: unknown): ApiError {
  if (err instanceof ApiError) return err

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      return new NetworkError(err.message)
    }
    return new UnknownError(err.message)
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const supabaseErr = err as { code: string; message?: string; status?: number }
    const message = supabaseErr.message ?? 'Unknown error'
    const status = supabaseErr.status

    if (status === 401 || supabaseErr.code === 'not_authenticated') return new AuthError(message)
    if (status === 404) return new NotFoundError(message)
    if (status === 409 || supabaseErr.code === '23505') return new ConflictError(message)
    if (status === 429) return new RateLimitError(message)
    if (status !== undefined && status >= 500) return new ServerError(message, status)

    return new UnknownError(message)
  }

  return new UnknownError(String(err))
}

/** Returns true if the error is worth retrying. */
export function isRetryable(err: ApiError): boolean {
  return err instanceof NetworkError || err instanceof ServerError
}
