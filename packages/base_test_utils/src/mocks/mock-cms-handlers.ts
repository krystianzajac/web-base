import { http, HttpResponse, type RequestHandler } from 'msw'

const DEFAULT_SUPABASE_URL = 'https://test.supabase.co'

/**
 * Creates MSW request handlers that intercept CMS table queries and return
 * matching content rows based on the provided content map.
 *
 * @param appId - The app_id to include in returned rows.
 * @param content - Map of CMS key → content string.
 *
 * @example
 * ```ts
 * server.use(...createMockCmsHandlers('my-app', { hero_title: 'Hello World' }))
 * ```
 */
export function createMockCmsHandlers(
  appId: string,
  content: Record<string, string>,
  supabaseUrl = DEFAULT_SUPABASE_URL,
): RequestHandler[] {
  const endpoint = `${supabaseUrl}/rest/v1/cms_content`

  return [
    http.get(endpoint, ({ request }) => {
      const url = new URL(request.url)
      // Supabase sends filter params as eq.{value}
      const rawKey = url.searchParams.get('key') ?? ''
      const key = rawKey.startsWith('eq.') ? rawKey.slice(3) : rawKey

      const matched = content[key]
      if (matched === undefined) return HttpResponse.json([])

      return HttpResponse.json([
        {
          app_id: appId,
          key,
          locale: 'en',
          content_json: matched,
        },
      ])
    }),
  ]
}

/**
 * Returns a mock `useCms`-compatible hook function for unit tests where MSW
 * is overkill (e.g. pure component tests).
 *
 * @example
 * ```ts
 * vi.mock('@web-base/base-cms', () => ({
 *   useCms: createMockCmsHook({ hero_title: 'Hello' }),
 * }))
 * ```
 */
export function createMockCmsHook(content: Record<string, string>) {
  return (key: string) => ({
    content: content[key] ?? null,
    loading: false,
    error: null,
  })
}
