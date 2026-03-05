import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { ApiQueryProvider } from '../query/api-query-provider'
import { useApiQuery } from '../query/use-api-query'
import { useApiMutation } from '../query/use-api-mutation'
import { AuthError, NetworkError } from '../errors/api-error'

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ApiQueryProvider client={client}>{children}</ApiQueryProvider>
  }
}

describe('useApiQuery', () => {
  it('returns data on success', async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: '1' }])
    const { result } = renderHook(() => useApiQuery(['items'], fetcher), {
      wrapper: makeWrapper(),
    })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual([{ id: '1' }])
    expect(result.current.error).toBeNull()
  })

  it('returns classified ApiError on failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new AuthError('not authed'))
    const { result } = renderHook(() => useApiQuery(['items'], fetcher), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeInstanceOf(AuthError)
    expect(result.current.data).toBeUndefined()
  })

  it('classifies plain errors into ApiError', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useApiQuery(['net'], fetcher), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeInstanceOf(NetworkError)
  })

  it('exposes a refetch function', async () => {
    const fetcher = vi.fn().mockResolvedValue([])
    const { result } = renderHook(() => useApiQuery(['refetch-test'], fetcher), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(typeof result.current.refetch).toBe('function')
  })
})

describe('useApiMutation', () => {
  it('returns data on successful mutation', async () => {
    const mutator = vi.fn().mockResolvedValue({ id: 'new' })
    const { result } = renderHook(() => useApiMutation(mutator), {
      wrapper: makeWrapper(),
    })

    result.current.mutate(undefined)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ id: 'new' })
    expect(result.current.error).toBeNull()
  })

  it('returns ApiError on failure', async () => {
    const mutator = vi.fn().mockRejectedValue(new AuthError('denied'))
    const { result } = renderHook(() => useApiMutation(mutator), {
      wrapper: makeWrapper(),
    })

    result.current.mutate(undefined)
    await waitFor(() => expect(result.current.error).toBeInstanceOf(AuthError))
    expect(result.current.data).toBeUndefined()
  })

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const mutator = vi.fn().mockResolvedValue('done')
    const { result } = renderHook(() => useApiMutation(mutator, { onSuccess }), {
      wrapper: makeWrapper(),
    })

    result.current.mutate(undefined)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onSuccess.mock.calls[0][0]).toBe('done')
  })
})
