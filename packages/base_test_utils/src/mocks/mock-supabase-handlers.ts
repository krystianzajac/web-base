import { http, HttpResponse, type RequestHandler } from 'msw'
import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'
import type { SetupServer } from 'msw/node'

const DEFAULT_SUPABASE_URL = 'https://test.supabase.co'

export interface MockTableOptions {
  rows?: unknown[]
  insertResponse?: unknown
  /** If set, all endpoints return this Supabase error shape instead of data. */
  error?: { code: string; message: string }
}

/**
 * Creates MSW request handlers that intercept Supabase REST calls for a table.
 *
 * Tests exercise the real error-normalisation path in base_api because the
 * actual Supabase client makes real HTTP calls — MSW intercepts them.
 *
 * @example
 * ```ts
 * const server = createMockServer(
 *   ...createSupabaseMockHandlers('profiles', { rows: [{ id: '1', name: 'Alice' }] })
 * )
 * ```
 */
export function createSupabaseMockHandlers(
  tableName: string,
  options: MockTableOptions = {},
  supabaseUrl = DEFAULT_SUPABASE_URL,
): RequestHandler[] {
  const { rows = [], insertResponse = {}, error } = options
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}`

  const errorBody = error
    ? { code: error.code, message: error.message, details: null, hint: null }
    : null

  return [
    http.get(endpoint, () => {
      if (errorBody) return HttpResponse.json(errorBody, { status: 400 })
      return HttpResponse.json(rows as Record<string, unknown>[])
    }),

    http.post(endpoint, () => {
      if (errorBody) return HttpResponse.json(errorBody, { status: 400 })
      return HttpResponse.json(insertResponse as Record<string, unknown>)
    }),

    http.patch(endpoint, async ({ request }) => {
      if (errorBody) return HttpResponse.json(errorBody, { status: 400 })
      const body = (await request.json()) as Record<string, unknown>
      const base = (rows[0] as Record<string, unknown> | undefined) ?? {}
      return HttpResponse.json({ ...base, ...body })
    }),

    http.delete(endpoint, () => {
      if (errorBody) return HttpResponse.json(errorBody, { status: 400 })
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}

/**
 * Creates a pre-configured MSW server and registers Vitest lifecycle hooks.
 * Call at module level in your test file — no manual beforeAll/afterAll needed.
 *
 * @example
 * ```ts
 * const server = createMockServer(
 *   ...createSupabaseMockHandlers('profiles', { rows })
 * )
 * // Then in tests: server.use(...) to add per-test overrides
 * ```
 */
export function createMockServer(...handlers: RequestHandler[]): SetupServer {
  const srv = setupServer(...handlers)
  beforeAll(() => srv.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => srv.resetHandlers())
  afterAll(() => srv.close())
  return srv
}
