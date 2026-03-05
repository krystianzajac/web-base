import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw-server'
import { createBrowserApiClient } from '../client/create-browser-api-client'
import { AuthError, NotFoundError, ConflictError, ServerError, NetworkError } from '../errors/api-error'

// A minimal valid-format JWT (role:anon, never expires in tests)
const TEST_URL = 'https://test.supabase.co'
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6OTk5OTk5OTk5OX0.test'

const TEST_CONFIG = { supabaseUrl: TEST_URL, supabaseAnonKey: TEST_KEY, retryAttempts: 3, retryDelay: 0 }

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createBrowserApiClient — successful queries', () => {
  it('returns rows on a successful GET', async () => {
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () =>
        HttpResponse.json([{ id: '1', name: 'Alice' }]),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { data, error } = await client.from('profiles').select('*')

    expect(error).toBeNull()
    expect(data).toEqual([{ id: '1', name: 'Alice' }])
  })

  it('returns null error on empty result set', async () => {
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () => HttpResponse.json([])),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { data, error } = await client.from('profiles').select('*')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})

describe('createBrowserApiClient — error normalisation', () => {
  it('normalises 401 to AuthError', async () => {
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () =>
        HttpResponse.json(
          { code: 'not_authenticated', message: 'JWT expired', details: null, hint: null },
          { status: 401 },
        ),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*')

    expect(error).toBeInstanceOf(AuthError)
    expect(error?.message).toContain('JWT expired')
  })

  it('normalises PGRST116 (406) to NotFoundError when using .single()', async () => {
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () =>
        HttpResponse.json(
          {
            code: 'PGRST116',
            message: 'JSON object requested, multiple (or no) rows returned',
            details: 'Results contain 0 rows',
            hint: null,
          },
          { status: 406 },
        ),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*').single()

    expect(error).toBeInstanceOf(NotFoundError)
  })

  it('normalises 409 to ConflictError', async () => {
    server.use(
      http.post(`${TEST_URL}/rest/v1/profiles`, () =>
        HttpResponse.json(
          { code: '23505', message: 'duplicate key value violates unique constraint', details: null, hint: null },
          { status: 409 },
        ),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').insert({ id: 'dup' })

    expect(error).toBeInstanceOf(ConflictError)
  })
})

describe('createBrowserApiClient — retry behaviour', () => {
  it('retries on 500 ServerError and succeeds on 3rd attempt', async () => {
    let attempts = 0
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () => {
        attempts++
        if (attempts < 3) {
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
        }
        return HttpResponse.json([{ id: '1' }])
      }),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { data, error } = await client.from('profiles').select('*')

    expect(error).toBeNull()
    expect(data).toEqual([{ id: '1' }])
    expect(attempts).toBe(3)
  })

  it('exhausts retries and returns ServerError after 3 failures', async () => {
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*')

    expect(error).toBeInstanceOf(ServerError)
  })

  it('does NOT retry on AuthError (401)', async () => {
    let attempts = 0
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () => {
        attempts++
        return HttpResponse.json({ code: 'not_authenticated', message: 'Not authed' }, { status: 401 })
      }),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*')

    expect(error).toBeInstanceOf(AuthError)
    expect(attempts).toBe(1) // Not retried
  })

  it('does NOT retry on NotFoundError (406/PGRST116)', async () => {
    let attempts = 0
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () => {
        attempts++
        return HttpResponse.json({ code: 'PGRST116', message: 'no rows' }, { status: 406 })
      }),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*').single()

    expect(error).toBeInstanceOf(NotFoundError)
    expect(attempts).toBe(1)
  })

  it('retries on network failure (HttpResponse.error) and returns NetworkError', async () => {
    let attempts = 0
    server.use(
      http.get(`${TEST_URL}/rest/v1/profiles`, () => {
        attempts++
        return HttpResponse.error()
      }),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.from('profiles').select('*')

    expect(error).toBeInstanceOf(NetworkError)
    expect(attempts).toBe(3) // Retried 3 times
  })
})

describe('createBrowserApiClient — rpc', () => {
  it('returns data from an rpc call', async () => {
    server.use(
      http.post(`${TEST_URL}/rest/v1/rpc/compute_total`, () =>
        HttpResponse.json(42),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { data, error } = await client.rpc('compute_total', { userId: 'u1' })

    expect(error).toBeNull()
    expect(data).toBe(42)
  })

  it('normalises rpc error', async () => {
    server.use(
      http.post(`${TEST_URL}/rest/v1/rpc/secure_fn`, () =>
        HttpResponse.json({ code: 'not_authenticated', message: 'Denied' }, { status: 401 }),
      ),
    )

    const client = createBrowserApiClient(TEST_CONFIG)
    const { error } = await client.rpc('secure_fn')

    expect(error).toBeInstanceOf(AuthError)
  })
})
