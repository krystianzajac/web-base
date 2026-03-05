import { describe, it, expect, vi } from 'vitest'
import { ApiClient } from '../client/api-client'
import { NotFoundError, ConflictError, AuthError } from '../errors/api-error'
import { makeMockSupabase } from './mock-supabase'

function makeClient(supabase: ReturnType<typeof makeMockSupabase>) {
  return new ApiClient(supabase as never, {
    retryAttempts: 1,
    retryDelay: 0,
    timeout: 5000,
  })
}

describe('ApiClient.query', () => {
  it('returns rows on success', async () => {
    const supabase = makeMockSupabase({ data: [{ id: '1', name: 'Alice' }], error: null })
    const client = makeClient(supabase)

    // Use a simpler approach: mock the chain to resolve via select
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Alice' }], error: null }),
    })

    const rows = await client.query('profiles')
    expect(rows).toEqual([{ id: '1', name: 'Alice' }])
  })

  it('throws classified error on Supabase error', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'dup key' } }),
    })

    await expect(client.query('profiles')).rejects.toBeInstanceOf(ConflictError)
  })

  it('applies eq filter', async () => {
    const eqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    ;(makeMockSupabase({ data: [], error: null }))
    const supabase = makeMockSupabase({ data: [], error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock })
    const client = makeClient(supabase)

    await client.query('profiles', { eq: { role: 'admin' } })
    expect(eqMock).toHaveBeenCalledWith('role', 'admin')
  })
})

describe('ApiClient.queryOne', () => {
  it('returns single row when found', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const maybeSingleMock = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
    const selectMock = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit: limitMock }), limit: limitMock })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock })

    const row = await client.queryOne('profiles')
    expect(row).toEqual({ id: '1' })
  })

  it('throws NotFoundError when no row returned', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
    const selectMock = vi.fn().mockReturnValue({ limit: limitMock })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock })

    await expect(client.queryOne('profiles')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('ApiClient.insert', () => {
  it('inserts and returns rows', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const selectMock = vi.fn().mockResolvedValue({ data: [{ id: '2', name: 'Bob' }], error: null })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert: insertMock })

    const rows = await client.insert('profiles', { name: 'Bob' })
    expect(rows).toEqual([{ id: '2', name: 'Bob' }])
    expect(insertMock).toHaveBeenCalledWith({ name: 'Bob' })
  })

  it('throws on insert error', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const selectMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'not_authenticated', status: 401, message: 'JWT expired' } })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert: insertMock })

    await expect(client.insert('profiles', { name: 'Bob' })).rejects.toBeInstanceOf(AuthError)
  })
})

describe('ApiClient.update', () => {
  it('updates and returns rows', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const resolvedSelectMock = vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Updated' }], error: null })
    const updateMock = vi.fn().mockReturnValue({ select: resolvedSelectMock })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ update: updateMock })

    const rows = await client.update('profiles', { name: 'Updated' })
    expect(rows).toEqual([{ id: '1', name: 'Updated' }])
  })
})

describe('ApiClient.delete', () => {
  it('deletes without error', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)

    const deleteMock = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ delete: deleteMock })

    await expect(client.delete('profiles')).resolves.toBeUndefined()
  })
})

describe('ApiClient.rpc', () => {
  it('calls rpc and returns data', async () => {
    const supabase = makeMockSupabase({ data: { result: 42 }, error: null })
    const client = makeClient(supabase)
    ;(supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { result: 42 }, error: null })

    const result = await client.rpc<{ result: number }>('compute_total', { userId: 'u1' })
    expect(result).toEqual({ result: 42 })
    expect(supabase.rpc).toHaveBeenCalledWith('compute_total', { userId: 'u1' })
  })

  it('throws on rpc error', async () => {
    const supabase = makeMockSupabase({ data: null, error: null })
    const client = makeClient(supabase)
    ;(supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { code: 'not_authenticated', status: 401, message: 'not authed' },
    })

    await expect(client.rpc('secure_fn')).rejects.toBeInstanceOf(AuthError)
  })
})
