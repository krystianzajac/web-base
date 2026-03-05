import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { createSupabaseMockHandlers } from '../mocks/mock-supabase-handlers'

const SUPABASE_URL = 'https://test.supabase.co'

const rows = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]

const server = setupServer(...createSupabaseMockHandlers('profiles', { rows }))

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createSupabaseMockHandlers', () => {
  it('GET returns configured rows', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`)
    const json = await res.json()
    expect(json).toEqual(rows)
  })

  it('POST returns configured insertResponse', async () => {
    server.use(...createSupabaseMockHandlers('profiles', { insertResponse: { id: '3', name: 'Carol' } }))
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, { method: 'POST', body: '{}' })
    const json = await res.json()
    expect(json).toEqual({ id: '3', name: 'Carol' })
  })

  it('DELETE returns 204', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, { method: 'DELETE' })
    expect(res.status).toBe(204)
  })

  it('error shape returned on error config', async () => {
    server.use(
      ...createSupabaseMockHandlers('profiles', {
        error: { code: 'PGRST301', message: 'Row not found' },
      }),
    )
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`)
    const json = await res.json()
    expect(json).toEqual({
      code: 'PGRST301',
      message: 'Row not found',
      details: null,
      hint: null,
    })
    expect(res.status).toBe(400)
  })
})
