import type { QueryFilters } from '../types/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

/**
 * Applies QueryFilters to a Supabase query builder, returning the modified query.
 */
export function applyFilters(query: SupabaseQuery, filters?: QueryFilters): SupabaseQuery {
  if (!filters) return query

  if (filters.eq) {
    for (const [col, val] of Object.entries(filters.eq)) {
      query = query.eq(col, val)
    }
  }
  if (filters.neq) {
    for (const [col, val] of Object.entries(filters.neq)) {
      query = query.neq(col, val)
    }
  }
  if (filters.gt) {
    for (const [col, val] of Object.entries(filters.gt)) {
      query = query.gt(col, val)
    }
  }
  if (filters.lt) {
    for (const [col, val] of Object.entries(filters.lt)) {
      query = query.lt(col, val)
    }
  }
  if (filters.in) {
    for (const [col, vals] of Object.entries(filters.in)) {
      query = query.in(col, vals)
    }
  }
  if (filters.order) {
    query = query.order(filters.order.column, { ascending: filters.order.ascending ?? true })
  }
  if (filters.limit !== undefined) {
    query = query.limit(filters.limit)
  }
  if (filters.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 1000) - 1)
  }

  return query
}
