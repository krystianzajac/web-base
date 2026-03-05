import type { AnalyticsConfig } from '../types/monitoring-config'

type EventType = 'screen' | 'event' | 'funnel'

interface AnalyticsEventPayload {
  event_type: EventType
  event_name: string
  properties?: Record<string, unknown> | null
  funnel_name?: string | null
  created_at: string
}

// Module-level config — set once via initAnalytics
let config: AnalyticsConfig | null = null

/**
 * Initialises the Analytics module. Call once at app startup before using
 * any `Analytics.*` methods.
 *
 * @example
 * ```ts
 * initAnalytics({
 *   enabled: process.env.NODE_ENV === 'production',
 *   apiClient: browserApiClient,
 * })
 * ```
 */
export function initAnalytics(analyticsConfig: AnalyticsConfig): void {
  config = analyticsConfig
}

/** Resets module state — for use in tests only. */
export function _resetAnalytics(): void {
  config = null
}

function recordEvent(payload: AnalyticsEventPayload): void {
  if (!config?.enabled) return

  if (config.apiClient) {
    // Fire and forget — analytics failures must never break the app
    config.apiClient
      .from('analytics_events')
      .insert(payload)
      .catch(() => undefined)
  }
}

/**
 * Static analytics class. Requires `initAnalytics` to be called first.
 * All methods are no-ops when `config.enabled` is false.
 */
export class Analytics {
  /** Records a screen view event. */
  static screen(name: string, properties?: Record<string, unknown>): void {
    recordEvent({
      event_type: 'screen',
      event_name: name,
      properties: properties ?? null,
      funnel_name: null,
      created_at: new Date().toISOString(),
    })
  }

  /** Records a user action or domain event. */
  static event(name: string, properties?: Record<string, unknown>): void {
    recordEvent({
      event_type: 'event',
      event_name: name,
      properties: properties ?? null,
      funnel_name: null,
      created_at: new Date().toISOString(),
    })
  }

  /** Records a funnel step — useful for conversion analysis. */
  static funnel(step: string, funnelName: string): void {
    recordEvent({
      event_type: 'funnel',
      event_name: step,
      properties: null,
      funnel_name: funnelName,
      created_at: new Date().toISOString(),
    })
  }
}
