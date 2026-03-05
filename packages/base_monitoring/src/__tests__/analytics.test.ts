import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startSpan: vi.fn(async (_opts: unknown, fn: (span: any) => unknown) => fn({})),
}))

import { Analytics, initAnalytics, _resetAnalytics } from '../analytics/analytics'

function makeMockClient() {
  const insertFn = vi.fn().mockResolvedValue({ data: null, error: null })
  const fromFn = vi.fn().mockReturnValue({ insert: insertFn })
  return { from: fromFn, insert: insertFn }
}

describe('Analytics — disabled', () => {
  beforeEach(() => {
    _resetAnalytics()
    initAnalytics({ enabled: false })
  })

  it('Analytics.screen is a no-op when disabled', () => {
    const client = makeMockClient()
    initAnalytics({ enabled: false, apiClient: client })
    Analytics.screen('Home')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('Analytics.event is a no-op when disabled', () => {
    const client = makeMockClient()
    initAnalytics({ enabled: false, apiClient: client })
    Analytics.event('button_click')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('Analytics.funnel is a no-op when disabled', () => {
    const client = makeMockClient()
    initAnalytics({ enabled: false, apiClient: client })
    Analytics.funnel('checkout', 'onboarding')
    expect(client.from).not.toHaveBeenCalled()
  })
})

describe('Analytics — enabled with apiClient', () => {
  let client: ReturnType<typeof makeMockClient>

  beforeEach(() => {
    _resetAnalytics()
    client = makeMockClient()
    initAnalytics({ enabled: true, apiClient: client })
  })

  it('Analytics.screen inserts a screen event into analytics_events', () => {
    Analytics.screen('Dashboard', { referrer: 'home' })

    expect(client.from).toHaveBeenCalledWith('analytics_events')
    expect(client.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'screen',
        event_name: 'Dashboard',
        properties: { referrer: 'home' },
      }),
    )
  })

  it('Analytics.event inserts an event row', () => {
    Analytics.event('sign_up_clicked')

    expect(client.from).toHaveBeenCalledWith('analytics_events')
    expect(client.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'event',
        event_name: 'sign_up_clicked',
      }),
    )
  })

  it('Analytics.funnel inserts a funnel step row with funnel_name', () => {
    Analytics.funnel('completed_profile', 'onboarding')

    expect(client.from).toHaveBeenCalledWith('analytics_events')
    expect(client.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'funnel',
        event_name: 'completed_profile',
        funnel_name: 'onboarding',
      }),
    )
  })

  it('uses the provided apiClient — does NOT create a new Supabase instance', () => {
    // Verify the exact client passed is the one called
    const otherClient = makeMockClient()
    Analytics.event('test')
    expect(otherClient.from).not.toHaveBeenCalled()
    expect(client.from).toHaveBeenCalled()
  })
})

describe('Analytics — enabled without apiClient', () => {
  beforeEach(() => {
    _resetAnalytics()
    initAnalytics({ enabled: true })
  })

  it('does not throw when no apiClient is configured', () => {
    expect(() => Analytics.event('no_client')).not.toThrow()
  })
})
