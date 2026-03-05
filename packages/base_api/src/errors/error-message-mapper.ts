import {
  ApiError,
  AuthError,
  ConflictError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from './api-error'

/**
 * Maps ApiError instances to i18n keys or human-readable messages.
 */
export const ErrorMessageMapper = {
  /**
   * Returns an i18n key for the given error (e.g. for react-i18next).
   */
  mapErrorToKey(err: ApiError): string {
    if (err instanceof NetworkError) return 'errors.network'
    if (err instanceof AuthError) return 'errors.auth'
    if (err instanceof NotFoundError) return 'errors.notFound'
    if (err instanceof ConflictError) return 'errors.conflict'
    if (err instanceof RateLimitError) return 'errors.rateLimit'
    if (err instanceof ServerError) return 'errors.server'
    return 'errors.unknown'
  },

  /**
   * Returns a human-readable fallback message for the given error.
   */
  mapError(err: ApiError): string {
    if (err instanceof NetworkError) return 'Check your internet connection and try again.'
    if (err instanceof AuthError) return 'You must be signed in to do this.'
    if (err instanceof NotFoundError) return 'The requested resource could not be found.'
    if (err instanceof ConflictError) return 'This action conflicts with existing data.'
    if (err instanceof RateLimitError) return 'Too many requests. Please wait and try again.'
    if (err instanceof ServerError) return 'A server error occurred. Please try again later.'
    return err.message || 'An unexpected error occurred.'
  },
}
