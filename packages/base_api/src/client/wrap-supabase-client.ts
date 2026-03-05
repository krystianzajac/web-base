import type { ApiConfig } from '../types/config'
import { normaliseError, isRetryable } from '../errors/normalise-error'
import type { ApiError } from '../errors/api-error'

interface RetryConfig {
  attempts: number
  delayMs: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type QueryResult = { data: unknown; error: ApiError | null }

/**
 * Executes a Supabase query builder with retry and error normalisation.
 *
 * `originalBuilder` is the unwrapped Supabase PostgrestBuilder. Calling its
 * `.then()` creates a fresh HTTP request each time — this is what makes retry work.
 */
// The Supabase builder resolves with { data, error, count, status, statusText }
// We capture `status` so normaliseError can use the HTTP status code even when
// PostgrestError doesn't include it in its own properties.
type BuilderResult = {
  data: unknown
  error: unknown
  status?: number
}

async function executeWithRetry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalBuilder: any,
  retryConfig: RetryConfig,
): Promise<QueryResult> {
  for (let attempt = 0; attempt < retryConfig.attempts; attempt++) {
    const result = await new Promise<BuilderResult>((resolve) => {
      // Call the original Supabase builder's then — creates a fresh HTTP request each time
      Promise.resolve()
        .then(() => originalBuilder)
        .then(
          (r: BuilderResult) => resolve(r),
          (networkErr: unknown) => resolve({ data: null, error: networkErr }),
        )
    })

    if (!result.error) {
      return { data: result.data, error: null }
    }

    // Pass the HTTP status separately so normaliseError can map 5xx → ServerError
    // even when PostgrestError doesn't embed it in its own properties
    const normalised = normaliseError(result.error, result.status)

    if (!isRetryable(normalised) || attempt === retryConfig.attempts - 1) {
      return { data: result.data, error: normalised }
    }

    await sleep(retryConfig.delayMs * Math.pow(2, attempt))
  }

  // Unreachable — TypeScript appeasement
  return { data: null, error: null }
}

/**
 * Wraps a Supabase query builder so that:
 * - All chained methods return wrapped builders (preserving the full query builder API)
 * - `await`ing the builder normalises the error to ApiError | null and handles retry
 *
 * @param original — the unwrapped Supabase builder (PostgrestQueryBuilder etc.)
 * @param retryConfig — retry settings from ApiConfig
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapBuilder<T>(original: T, retryConfig: RetryConfig): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy(original as any, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, prop: string | symbol) {
      // Intercept `then` — this is what `await` calls on the builder
      if (prop === 'then') {
        return (
          onfulfilled?: (value: QueryResult) => unknown,
          onrejected?: (reason: unknown) => unknown,
        ) => executeWithRetry(target, retryConfig).then(onfulfilled, onrejected)
      }

      const value = Reflect.get(target, prop)

      // Wrap any method that returns a Supabase builder object
      if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: any[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = value.apply(target, args)
          // If the result looks like a Supabase builder (has `then`), wrap it
          if (result !== null && typeof result === 'object' && 'then' in result) {
            return wrapBuilder(result, retryConfig)
          }
          return result
        }
      }

      return value
    },
  }) as T
}

/**
 * Wraps a Supabase client so that `.from()` and `.rpc()` return builders
 * with transparent error normalisation and retry.
 *
 * The full Supabase query builder API is preserved — apps retain column-level
 * type safety when using `supabase gen types typescript`.
 */
export function wrapSupabaseClient<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  config: Required<Pick<ApiConfig, 'retryAttempts' | 'retryDelay'>>,
): T {
  const retryConfig: RetryConfig = {
    attempts: config.retryAttempts,
    delayMs: config.retryDelay,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy(client as any, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, prop: string | symbol) {
      if (prop === 'from') {
        return (tableName: string) => {
          const builder = target.from(tableName)
          return wrapBuilder(builder, retryConfig)
        }
      }
      if (prop === 'rpc') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (fnName: string, ...args: any[]) => {
          const builder = target.rpc(fnName, ...args)
          return wrapBuilder(builder, retryConfig)
        }
      }
      return Reflect.get(target, prop)
    },
  }) as T
}
