import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { mockAuthClient, mockRawSession, resetMocks } from './mock-supabase'
import { renderAuthHook } from './test-utils'

// ── Mock @supabase/ssr ──────────────────────────────────────────────────────

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockAuthClient),
  createServerClient: vi.fn(() => mockAuthClient),
}))

import { useAuth } from '../hooks/use-auth'

// Re-import to access updated capturedAuthCallback after vi.mock
import * as mockModule from './mock-supabase'

describe('useAuth', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('starts with loading=true and no user', () => {
    const { result } = renderAuthHook(useAuth)
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('transitions to authenticated state after SIGNED_IN event', async () => {
    const { result } = renderAuthHook(useAuth)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.id).toBe('user-123')
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.user?.displayName).toBe('Test User')
  })

  it('clears user on SIGNED_OUT event', async () => {
    const { result } = renderAuthHook(useAuth)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })
    expect(result.current.user).not.toBeNull()

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_OUT', null)
    })
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  describe('signIn', () => {
    it('calls signInWithPassword and resolves on success', async () => {
      mockAuthClient.auth.signInWithPassword.mockResolvedValueOnce({ error: null })
      const { result } = renderAuthHook(useAuth)

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      expect(mockAuthClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('sets error state and throws on wrong password', async () => {
      mockAuthClient.auth.signInWithPassword.mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      })
      const { result } = renderAuthHook(useAuth)

      await act(async () => {
        await expect(
          result.current.signIn('test@example.com', 'wrongpassword'),
        ).rejects.toThrow('Invalid login credentials')
      })

      expect(result.current.error).toBe('Invalid login credentials')
    })
  })

  describe('signUp', () => {
    it('calls signUp with display_name metadata', async () => {
      mockAuthClient.auth.signUp.mockResolvedValueOnce({ error: null })
      const { result } = renderAuthHook(useAuth)

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123', 'Alice')
      })

      expect(mockAuthClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: { data: { display_name: 'Alice' } },
      })
    })

    it('throws and sets error on sign-up failure', async () => {
      mockAuthClient.auth.signUp.mockResolvedValueOnce({
        error: { message: 'Email already in use' },
      })
      const { result } = renderAuthHook(useAuth)

      await act(async () => {
        await expect(
          result.current.signUp('existing@example.com', 'password123', 'Alice'),
        ).rejects.toThrow('Email already in use')
      })
      expect(result.current.error).toBe('Email already in use')
    })
  })

  describe('signOut', () => {
    it('calls signOut and clears user', async () => {
      mockAuthClient.auth.signOut.mockResolvedValueOnce({ error: null })
      const { result } = renderAuthHook(useAuth)

      // Sign in first
      await act(async () => {
        mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
      })
      expect(result.current.user).not.toBeNull()

      await act(async () => {
        await result.current.signOut()
        mockModule.capturedAuthCallback?.('SIGNED_OUT', null)
      })

      expect(mockAuthClient.auth.signOut).toHaveBeenCalledTimes(1)
      expect(result.current.user).toBeNull()
    })
  })
})
