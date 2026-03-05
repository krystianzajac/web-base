/**
 * Configuration for the ApiClient.
 */
export interface ApiConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  /** Number of retry attempts for transient errors. Default: 3 */
  retryAttempts?: number
  /** Base delay in ms between retries (doubles each attempt). Default: 1000 */
  retryDelay?: number
  /** Request timeout in ms. Default: 10000 */
  timeout?: number
}

/**
 * Filters for querying a Supabase table.
 */
export interface QueryFilters {
  eq?: Record<string, unknown>
  neq?: Record<string, unknown>
  gt?: Record<string, unknown>
  lt?: Record<string, unknown>
  in?: Record<string, unknown[]>
  order?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}
