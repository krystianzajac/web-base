import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthClient, mockRawSession, resetMocks } from './mock-supabase'
import type { ServerCookieStore } from '../server/types'

// vi.mock is hoisted — use vi.hoisted for variables referenced in the factory
const mockCreateServerClient = vi.hoisted(() => vi.fn())

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockAuthClient),
  createServerClient: mockCreateServerClient,
}))

import { getServerSession } from '../server/get-server-session'
import { testConfig } from './test-utils'

const mockCookieStore: ServerCookieStore = {
  getAll: vi.fn().mockReturnValue([
    { name: 'sb-access-token', value: 'tok-abc' },
    { name: 'sb-refresh-token', value: 'ref-xyz' },
  ]),
  set: vi.fn(),
}

describe('getServerSession', () => {
  beforeEach(() => {
    resetMocks()
    mockCreateServerClient.mockReturnValue(mockAuthClient)
  })

  it('returns a Session when cookie is valid', async () => {
    mockAuthClient.auth.getSession.mockResolvedValueOnce({
      data: { session: mockRawSession },
      error: null,
    })

    const session = await getServerSession(mockCookieStore, testConfig)

    expect(session).not.toBeNull()
    expect(session?.token).toBe('tok-abc')
    expect(session?.userId).toBe('user-123')
    expect(session?.expiresAt).toBeInstanceOf(Date)
  })

  it('returns null when no session in cookie store', async () => {
    mockAuthClient.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const session = await getServerSession(mockCookieStore, testConfig)
    expect(session).toBeNull()
  })

  it('returns null on Supabase error', async () => {
    mockAuthClient.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'JWT malformed' },
    })

    const session = await getServerSession(mockCookieStore, testConfig)
    expect(session).toBeNull()
  })

  it('creates the server client with the provided config URL and key', async () => {
    mockAuthClient.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    await getServerSession(mockCookieStore, testConfig)

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      testConfig.supabaseUrl,
      testConfig.supabaseAnonKey,
      expect.objectContaining({ cookies: expect.any(Object) }),
    )
  })
})
