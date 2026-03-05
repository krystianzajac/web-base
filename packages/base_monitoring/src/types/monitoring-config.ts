export interface MonitoringConfig {
  dsn: string
  environment: 'dev' | 'staging' | 'prod'
  release?: string
  /** Fraction of transactions to send to Sentry. Defaults to 0.1 in prod, 1.0 in dev/staging. */
  tracesSampleRate?: number
  debug?: boolean
}

/**
 * Minimal duck-typed interface for the API client used by Analytics.
 * Kept loose to avoid coupling base_monitoring to base_api.
 */
export interface AnalyticsApiClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): { insert(data: unknown): Promise<any> }
}

export interface AnalyticsConfig {
  enabled: boolean
  /** Pass the existing createBrowserApiClient() instance — never create a new Supabase connection. */
  apiClient?: AnalyticsApiClient
}
