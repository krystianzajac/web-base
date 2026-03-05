import { createServerClient } from '@supabase/ssr'
import { classifyError } from '../errors/error-classifier'
import { withRetry } from '../utils/retry'
import { applyFilters } from '../utils/apply-filters'
import type { ApiConfig, QueryFilters } from '../types/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createServerClient<any>>

/**
 * Typed API client. All Supabase access goes through this class.
 * Apps never call Supabase directly.
 */
export class ApiClient {
  private readonly retryAttempts: number
  private readonly retryDelay: number

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly config: Required<Pick<ApiConfig, 'retryAttempts' | 'retryDelay' | 'timeout'>>,
  ) {
    this.retryAttempts = config.retryAttempts
    this.retryDelay = config.retryDelay
  }

  /**
   * Query multiple rows from a table.
   */
  async query<T>(table: string, filters?: QueryFilters): Promise<T[]> {
    return withRetry(
      async () => {
        let q = this.supabase.from(table).select('*')
        q = applyFilters(q, filters)
        const { data, error } = await q
        if (error) throw classifyError(error)
        return (data ?? []) as T[]
      },
      { attempts: this.retryAttempts, delayMs: this.retryDelay },
    )
  }

  /**
   * Query a single row. Throws NotFoundError if no row is found.
   */
  async queryOne<T>(table: string, filters?: QueryFilters): Promise<T> {
    return withRetry(
      async () => {
        let q = this.supabase.from(table).select('*')
        q = applyFilters(q, filters)
        const { data, error } = await q.limit(1).maybeSingle()
        if (error) throw classifyError(error)
        if (!data) {
          const { NotFoundError } = await import('../errors/api-error')
          throw new NotFoundError(`No row found in "${table}"`)
        }
        return data as T
      },
      { attempts: this.retryAttempts, delayMs: this.retryDelay },
    )
  }

  /**
   * Insert one or more rows.
   */
  async insert<T>(table: string, rows: Partial<T> | Partial<T>[]): Promise<T[]> {
    return withRetry(
      async () => {
        const { data, error } = await this.supabase
          .from(table)
          .insert(rows as never)
          .select()
        if (error) throw classifyError(error)
        return (data ?? []) as T[]
      },
      { attempts: 1, delayMs: this.retryDelay },
    )
  }

  /**
   * Update rows matching the given filters.
   */
  async update<T>(table: string, updates: Partial<T>, filters?: QueryFilters): Promise<T[]> {
    return withRetry(
      async () => {
        let q = this.supabase.from(table).update(updates as never).select()
        q = applyFilters(q, filters)
        const { data, error } = await q
        if (error) throw classifyError(error)
        return (data ?? []) as T[]
      },
      { attempts: 1, delayMs: this.retryDelay },
    )
  }

  /**
   * Delete rows matching the given filters.
   */
  async delete(table: string, filters?: QueryFilters): Promise<void> {
    return withRetry(
      async () => {
        let q = this.supabase.from(table).delete()
        q = applyFilters(q, filters)
        const { error } = await q
        if (error) throw classifyError(error)
      },
      { attempts: 1, delayMs: this.retryDelay },
    )
  }

  /**
   * Call a Supabase Edge Function / RPC.
   */
  async rpc<T>(fnName: string, params?: Record<string, unknown>): Promise<T> {
    return withRetry(
      async () => {
        const { data, error } = await this.supabase.rpc(fnName, params ?? {})
        if (error) throw classifyError(error)
        return data as T
      },
      { attempts: this.retryAttempts, delayMs: this.retryDelay },
    )
  }
}
