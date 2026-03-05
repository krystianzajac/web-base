import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { mockAuthClient, mockRawSession, mockRawExpiredSession, resetMocks } from './mock-supabase'
import { renderAuthHook } from './test-utils'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockAuthClient),
  createServerClient: vi.fn(() => mockAuthClient),
}))

import { useSession } from '../hooks/use-session'
import * as mockModule from './mock-supabase'

describe('useSession', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('returns null session when not authenticated', () => {
    const { result } = renderAuthHook(useSession)
    expect(result.current.session).toBeNull()
    expect(result.current.isExpired).toBe(false)
  })

  it('returns session data after SIGNED_IN', async () => {
    const { result } = renderAuthHook(useSession)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })

    expect(result.current.session).not.toBeNull()
    expect(result.current.session?.token).toBe('tok-abc')
    expect(result.current.session?.userId).toBe('user-123')
    expect(result.current.isExpired).toBe(false)
  })

  it('reports isExpired=true for an expired session', async () => {
    const { result } = renderAuthHook(useSession)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawExpiredSession)
    })

    expect(result.current.session).not.toBeNull()
    expect(result.current.isExpired).toBe(true)
  })

  it('updates session after refresh', async () => {
    const refreshedSession = {
      ...mockRawSession,
      access_token: 'tok-refreshed',
      expires_at: Math.floor(Date.now() / 1000) + 7200,
    }
    mockAuthClient.auth.refreshSession.mockResolvedValueOnce({
      data: { session: refreshedSession },
      error: null,
    })

    const { result } = renderAuthHook(useSession)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })
    expect(result.current.session?.token).toBe('tok-abc')

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.session?.token).toBe('tok-refreshed')
  })

  it('throws on refresh failure', async () => {
    mockAuthClient.auth.refreshSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Token expired' },
    })
    const { result } = renderAuthHook(useSession)

    await act(async () => {
      await expect(result.current.refresh()).rejects.toThrow('Token expired')
    })
  })
})
