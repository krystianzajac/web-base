// Types
export type {
  ApiConfig,
  ServerCookieStore,
  MiddlewareRequest,
  CookieItem,
  CookieSetOptions,
} from './types/config'

// Errors
export {
  ApiError,
  NetworkError,
  AuthError,
  NotFoundError,
  ConflictError,
  ServerError,
  RateLimitError,
  UnknownError,
} from './errors/api-error'
export { normaliseError, isRetryable } from './errors/normalise-error'
export { ErrorMessageMapper } from './errors/error-message-mapper'

// Client factories — expose the full Supabase typed query builder with error normalisation + retry
export { createBrowserApiClient } from './client/create-browser-api-client'
export { createServerApiClient } from './client/create-server-api-client'
export { createMiddlewareApiClient } from './client/create-middleware-api-client'

// Utility — for retrying arbitrary async operations outside query builders
export { withRetry } from './utils/retry'

// TanStack Query integration
export { ApiQueryProvider } from './query/api-query-provider'
export { useApiQuery } from './query/use-api-query'
export { useApiMutation } from './query/use-api-mutation'
