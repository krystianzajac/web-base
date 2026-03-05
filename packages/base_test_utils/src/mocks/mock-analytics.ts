export interface MockAnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

export interface MockAnalyticsInstance {
  /** All events recorded since creation (or last clear). */
  events: MockAnalyticsEvent[]
  /** Returns true if an event with the given name was fired. */
  wasEventFired(name: string): boolean
}

/**
 * Creates a mock analytics collector that records events for assertion.
 *
 * @example
 * ```ts
 * const analytics = createMockAnalytics()
 * analytics.events.push({ name: 'page_view', properties: { page: '/home' } })
 * expect(analytics.wasEventFired('page_view')).toBe(true)
 * ```
 */
export function createMockAnalytics(): MockAnalyticsInstance {
  const events: MockAnalyticsEvent[] = []

  return {
    events,
    wasEventFired(name: string): boolean {
      return events.some((e) => e.name === name)
    },
  }
}
