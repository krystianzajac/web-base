import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import type { ApiError } from '../errors/api-error'
import { normaliseError } from '../errors/normalise-error'

interface UseApiMutationResult<T, V> {
  mutate: (variables: V) => void
  mutateAsync: (variables: V) => Promise<T>
  loading: boolean
  error: ApiError | null
  data: T | undefined
}

/**
 * Wraps TanStack Query's `useMutation` with typed ApiError handling.
 *
 * @param mutator - Async function that performs the mutation
 * @param options - Optional TanStack Mutation options (except mutationFn)
 *
 * @example
 * ```ts
 * const { mutate, loading, error } = useApiMutation((vars: { name: string }) =>
 *   client.from('profiles').insert(vars).select().single()
 * )
 * ```
 */
export function useApiMutation<T, V = void>(
  mutator: (variables: V) => Promise<T>,
  options?: Omit<UseMutationOptions<T, ApiError, V>, 'mutationFn'>,
): UseApiMutationResult<T, V> {
  const { mutate, mutateAsync, isPending, error, data } = useMutation<T, ApiError, V>({
    mutationFn: async (variables) => {
      try {
        return await mutator(variables)
      } catch (err) {
        throw normaliseError(err)
      }
    },
    ...options,
  })

  return {
    mutate,
    mutateAsync,
    loading: isPending,
    error: error ?? null,
    data,
  }
}
