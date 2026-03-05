import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// ── Hoisted mock objects (must be declared before vi.mock factories run) ──────
const { mockNextResponse, mockRedirectResponse } = vi.hoisted(() => {
  const mockCookiesSet = vi.fn()
  const mockNextResponse = { cookies: { set: mockCookiesSet } }
  const mockRedirectResponse = { status: 302, location: '' }
  return { mockNextResponse, mockRedirectResponse }
})

// ── Mock next/server ──────────────────────────────────────────────────────────
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn().mockReturnValue(mockNextResponse),
    redirect: vi.fn((url: URL) => {
      mockRedirectResponse.location = url.toString()
      return mockRedirectResponse
    }),
  },
}))

// ── Mock base_auth/server ─────────────────────────────────────────────────────
vi.mock('@web-base/base-auth/server', () => ({
  updateSession: vi.fn().mockResolvedValue({ cookies: [] }),
}))

// ── Mock base_api ─────────────────────────────────────────────────────────────
const mockGetUser = vi.fn()

vi.mock('@web-base/base-api', () => ({
  createMiddlewareApiClient: vi.fn().mockImplementation(() => ({
    client: { auth: { getUser: mockGetUser } },
    pendingCookies: [],
  })),
}))

// ── Mock config ───────────────────────────────────────────────────────────────
vi.mock('@/lib/config', () => ({
  authConfig: { supabaseUrl: 'https://test.supabase.co', supabaseAnonKey: 'test' },
  apiConfig: { supabaseUrl: 'https://test.supabase.co', supabaseAnonKey: 'test' },
}))

// Import after mocks are set up
import { middleware } from '../../middleware'
import { NextResponse } from 'next/server'

function makeRequest(pathname: string): NextRequest {
  return {
    nextUrl: new URL(`http://localhost:3000${pathname}`),
    url: `http://localhost:3000${pathname}`,
    cookies: { getAll: () => [], set: vi.fn() },
  } as unknown as NextRequest
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    // Reset mock implementation
    ;(NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(mockNextResponse)
    ;(NextResponse.redirect as ReturnType<typeof vi.fn>).mockImplementation((url: URL) => {
      mockRedirectResponse.location = url.toString()
      return mockRedirectResponse
    })
  })

  it('redirects unauthenticated user from /dashboard to /auth/signin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await middleware(makeRequest('/dashboard'))

    expect(result).toBe(mockRedirectResponse)
    expect(mockRedirectResponse.location).toContain('/auth/signin')
  })

  it('includes ?next param in redirect URL', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    await middleware(makeRequest('/dashboard/settings'))

    expect(mockRedirectResponse.location).toContain('next=%2Fdashboard%2Fsettings')
  })

  it('allows authenticated user through /dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'alice@example.com' } },
      error: null,
    })

    const result = await middleware(makeRequest('/dashboard'))

    expect(result).toBe(mockNextResponse)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated user through public routes', async () => {
    const result = await middleware(makeRequest('/'))

    expect(result).toBe(mockNextResponse)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated user through /auth/signin', async () => {
    const result = await middleware(makeRequest('/auth/signin'))

    expect(result).toBe(mockNextResponse)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })
})
