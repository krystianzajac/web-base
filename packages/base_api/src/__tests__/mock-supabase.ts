import { vi } from 'vitest'

export function makeMockSupabase(_queryResult?: { data: unknown; error: unknown }) {
  const rpc = vi.fn()
  const from = vi.fn()

  return { from, rpc }
}
