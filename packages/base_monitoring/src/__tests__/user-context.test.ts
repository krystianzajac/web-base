import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startSpan: vi.fn(async (_opts: unknown, fn: (span: any) => unknown) => fn({})),
}))

import * as Sentry from '@sentry/nextjs'
import { setUserContext, clearUserContext } from '../logging/user-context'

describe('setUserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls Sentry.setUser with the provided id', () => {
    setUserContext('user-abc-123')
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'user-abc-123' })
  })

  it('merges additional properties onto the Sentry user object', () => {
    setUserContext('user-abc-123', { role: 'admin', plan: 'pro' })
    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: 'user-abc-123',
      role: 'admin',
      plan: 'pro',
    })
  })
})

describe('clearUserContext', () => {
  it('calls Sentry.setUser(null)', () => {
    clearUserContext()
    expect(Sentry.setUser).toHaveBeenCalledWith(null)
  })
})
