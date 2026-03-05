import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { ApiError } from '../errors/api-error'
import { normaliseError } from '../errors/normalise-error'

interface UseApiQueryResult<T> {
  data: T | undefined
  loading: boolean
  error: ApiError | null
  refetch: () => void
}

/**
 * Wraps TanStack Query's `useQuery` with typed ApiError handling.
 *
 * @param key - Query key array (used for cache invalidation)
 * @param fetcher - Async function that returns the data
 * @param options - Optional TanStack Query options (except queryKey/queryFn)
 *
 * @example
 * ```ts
 * const { data, loading, error } = useApiQuery(['profiles'], () => api.query('profiles'))
 * ```
 */
export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>,
): UseApiQueryResult<T> {
  const { data, isFetching, error, refetch } = useQuery<T, ApiError>({
    queryKey: key,
    queryFn: async () => {
      try {
        return await fetcher()
      } catch (err) {
        throw normaliseError(err)
      }
    },
    ...options,
  })

  return {
    data,
    loading: isFetching,
    error: error ?? null,
    refetch: () => void refetch(),
  }
}
