import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { mockAuthClient, mockRawSession, resetMocks } from './mock-supabase'
import { renderAuthHook } from './test-utils'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockAuthClient),
  createServerClient: vi.fn(() => mockAuthClient),
}))

import { useTwoFactor } from '../hooks/use-two-factor'
import * as mockModule from './mock-supabase'

describe('useTwoFactor', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('isEnrolled is false initially', () => {
    const { result } = renderAuthHook(useTwoFactor)
    expect(result.current.isEnrolled).toBe(false)
  })

  it('isEnrolled becomes true when TOTP factor is present on sign-in', async () => {
    mockAuthClient.auth.mfa.listFactors.mockResolvedValueOnce({
      data: { totp: [{ id: 'factor-1', status: 'verified' }] },
      error: null,
    })
    const { result } = renderAuthHook(useTwoFactor)

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })

    expect(result.current.isEnrolled).toBe(true)
  })

  describe('enroll', () => {
    it('returns qrUri and secret on success', async () => {
      mockAuthClient.auth.mfa.enroll.mockResolvedValueOnce({
        data: {
          totp: {
            qr_code: 'data:image/png;base64,qr-code-data',
            secret: 'TOTP_SECRET_BASE32',
          },
        },
        error: null,
      })
      const { result } = renderAuthHook(useTwoFactor)

      let enrollResult: { qrUri: string; secret: string } | undefined
      await act(async () => {
        enrollResult = await result.current.enroll()
      })

      expect(enrollResult?.qrUri).toBe('data:image/png;base64,qr-code-data')
      expect(enrollResult?.secret).toBe('TOTP_SECRET_BASE32')
      expect(mockAuthClient.auth.mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp' })
    })

    it('throws on enroll failure', async () => {
      mockAuthClient.auth.mfa.enroll.mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot enroll at this time' },
      })
      const { result } = renderAuthHook(useTwoFactor)

      await act(async () => {
        await expect(result.current.enroll()).rejects.toThrow('Cannot enroll at this time')
      })
    })
  })

  describe('verify', () => {
    it('verifies correct code successfully', async () => {
      mockAuthClient.auth.mfa.listFactors.mockResolvedValue({
        data: { totp: [{ id: 'factor-1' }] },
        error: null,
      })
      mockAuthClient.auth.mfa.challenge.mockResolvedValueOnce({
        data: { id: 'challenge-1' },
        error: null,
      })
      mockAuthClient.auth.mfa.verify.mockResolvedValueOnce({ error: null })

      const { result } = renderAuthHook(useTwoFactor)

      await act(async () => {
        await result.current.verify('123456')
      })

      expect(mockAuthClient.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'factor-1',
        challengeId: 'challenge-1',
        code: '123456',
      })
      expect(result.current.isEnrolled).toBe(true)
    })

    it('throws on wrong code', async () => {
      mockAuthClient.auth.mfa.listFactors.mockResolvedValue({
        data: { totp: [{ id: 'factor-1' }] },
        error: null,
      })
      mockAuthClient.auth.mfa.challenge.mockResolvedValueOnce({
        data: { id: 'challenge-1' },
        error: null,
      })
      mockAuthClient.auth.mfa.verify.mockResolvedValueOnce({
        error: { message: 'Invalid TOTP code' },
      })
      const { result } = renderAuthHook(useTwoFactor)

      await act(async () => {
        await expect(result.current.verify('000000')).rejects.toThrow('Invalid TOTP code')
      })
    })
  })

  describe('unenroll', () => {
    it('unenrolls the TOTP factor and sets isEnrolled to false', async () => {
      mockAuthClient.auth.mfa.listFactors.mockResolvedValue({
        data: { totp: [{ id: 'factor-1' }] },
        error: null,
      })
      mockAuthClient.auth.mfa.unenroll.mockResolvedValueOnce({ error: null })

      const { result } = renderAuthHook(useTwoFactor)

      // Simulate signed-in with MFA enrolled
      mockAuthClient.auth.mfa.listFactors.mockResolvedValueOnce({
        data: { totp: [{ id: 'factor-1', status: 'verified' }] },
        error: null,
      })
      await act(async () => {
        mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
      })
      expect(result.current.isEnrolled).toBe(true)

      mockAuthClient.auth.mfa.listFactors.mockResolvedValue({
        data: { totp: [{ id: 'factor-1' }] },
        error: null,
      })
      await act(async () => {
        await result.current.unenroll()
      })

      expect(result.current.isEnrolled).toBe(false)
      expect(mockAuthClient.auth.mfa.unenroll).toHaveBeenCalledWith({ factorId: 'factor-1' })
    })
  })
})
