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
 * Maps any thrown value (Supabase PostgrestError, network error, unknown) to a typed ApiError.
 *
 * `httpStatus` is passed separately because `PostgrestError` doesn't always embed the HTTP status
 * in its own properties — the builder resolves with `{ status }` alongside the error object.
 */
export function normaliseError(err: unknown, httpStatus?: number): ApiError {
  if (err instanceof ApiError) return err

  // Handle Error instances FIRST — before the generic object check —
  // because Error instances ARE objects, and we need instanceof to win.
  if (err instanceof TypeError) {
    return new NetworkError(err.message)
  }
  if (err instanceof Error) {
    if (/network|fetch|timeout|abort|econnrefused/i.test(err.message)) {
      return new NetworkError(err.message)
    }
    return new UnknownError(err.message)
  }

  // Supabase PostgrestError or similar plain objects with { code, message, status }
  if (err !== null && typeof err === 'object') {
    const e = err as Record<string, unknown>
    const code = typeof e.code === 'string' ? e.code : ''
    const message = typeof e.message === 'string' ? e.message : 'Unknown error'
    // Prefer status from the error object; fall back to the HTTP status from the builder response
    const status = typeof e.status === 'number' ? e.status : httpStatus

    if (status === 401 || status === 403 || code === 'not_authenticated') return new AuthError(message)
    // 406 is what Supabase returns for .single() / .maybeSingle() with PGRST116 — check before 404
    if ((status === 406 || status === 404) && code === 'PGRST116') return new NotFoundError(message)
    if (status === 404) return new NotFoundError(message)
    if (code === 'PGRST116') return new NotFoundError(message)
    if (status === 409 || code === '23505') return new ConflictError(message)
    if (status === 429) return new RateLimitError(message)
    if (status !== undefined && status >= 500) return new ServerError(message, status)

    // The Supabase client sometimes catches a network TypeError and stores its .message
    // (e.g. "TypeError: Failed to fetch") as the error message in a plain object.
    if (/TypeError:|network|fetch|timeout|abort|econnrefused/i.test(message)) {
      return new NetworkError(message)
    }

    return new UnknownError(message)
  }

  return new UnknownError(String(err))
}

/** Returns true if the error warrants a retry. */
export function isRetryable(err: ApiError): boolean {
  return err instanceof NetworkError || err instanceof ServerError
}
