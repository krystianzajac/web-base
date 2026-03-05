import React from 'react'
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from './msw-server'
import { createBrowserApiClient } from '@web-base/base-api'
import { CmsProvider } from '../client/cms-context'
import { useCms } from '../client/use-cms'
import type { CmsConfig } from '../types/cms-config'
import { getCacheKey } from '../cache/local-storage-cache'

const TEST_URL = 'https://test.supabase.co'
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6OTk5OTk5OTk5OX0.test'

const CONFIG: CmsConfig = {
  supabaseUrl: TEST_URL,
  supabaseAnonKey: TEST_KEY,
  appId: 'test-app',
  defaultLocale: 'en',
  cacheTtlMs: 300_000,
  fallbackToDefaultLocale: true,
}

const CMS_ENDPOINT = `${TEST_URL}/rest/v1/cms_content`

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

function makeWrapper() {
  const apiClient = createBrowserApiClient({
    supabaseUrl: TEST_URL,
    supabaseAnonKey: TEST_KEY,
    retryAttempts: 1,
    retryDelay: 0,
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <CmsProvider config={CONFIG} apiClient={apiClient}>
      {children}
    </CmsProvider>
  )
  return Wrapper
}

describe('useCms — cache miss → fetches → caches result', () => {
  it('fetches content and stores it in localStorage', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: 'Welcome!' }]),
      ),
    )

    const { result } = renderHook(() => useCms('welcome'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBe('Welcome!')
    expect(result.current.error).toBeNull()

    // Verify it was written to localStorage
    const cacheKey = getCacheKey(CONFIG.appId, 'welcome', CONFIG.defaultLocale)
    const raw = localStorage.getItem(cacheKey)
    expect(raw).not.toBeNull()
  })
})

describe('useCms — cache hit within TTL → no network call', () => {
  it('returns cached content without making a network request', async () => {
    const cacheKey = getCacheKey(CONFIG.appId, 'welcome', CONFIG.defaultLocale)
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ content: 'Cached content', timestamp: Date.now() }),
    )

    let requestCount = 0
    server.use(
      http.get(CMS_ENDPOINT, () => {
        requestCount++
        return HttpResponse.json([{ content_json: 'Should not be fetched' }])
      }),
    )

    const { result } = renderHook(() => useCms('welcome'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBe('Cached content')
    expect(requestCount).toBe(0)
  })
})

describe('useCms — expired cache → re-fetches', () => {
  it('ignores stale cache and fetches fresh content', async () => {
    const cacheKey = getCacheKey(CONFIG.appId, 'welcome', CONFIG.defaultLocale)
    // Write cache entry with timestamp 10 minutes in the past (well past the 5 min TTL)
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ content: 'Old content', timestamp: Date.now() - 10 * 60 * 1000 }),
    )

    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: 'Fresh content' }]),
      ),
    )

    const { result } = renderHook(() => useCms('welcome'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBe('Fresh content')
  })
})

describe('useCms — locale not found → falls back to defaultLocale', () => {
  it('retries with defaultLocale when requested locale has no entry', async () => {
    server.use(
      http.get(CMS_ENDPOINT, ({ request }) => {
        const url = new URL(request.url)
        const locale = url.searchParams.get('locale')
        if (locale === 'eq.fr') {
          return HttpResponse.json([]) // no French content
        }
        return HttpResponse.json([{ content_json: 'English fallback' }])
      }),
    )

    const { result } = renderHook(() => useCms('welcome', 'fr'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBe('English fallback')
  })
})

describe('useCms — key not found → content is null', () => {
  it('returns content: null when the key does not exist in any locale', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () => HttpResponse.json([])),
    )

    const { result } = renderHook(
      () =>
        useCms('missing_key', 'en'),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <CmsProvider
            config={{ ...CONFIG, fallbackToDefaultLocale: false }}
            apiClient={createBrowserApiClient({ supabaseUrl: TEST_URL, supabaseAnonKey: TEST_KEY, retryAttempts: 1, retryDelay: 0 })}
          >
            {children}
          </CmsProvider>
        ),
      },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBeNull()
    expect(result.current.error).toBeNull()
  })
})

describe('useCms — object content_json', () => {
  it('JSON.stringifies non-string content_json', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: { text: 'Rich content', bold: true } }]),
      ),
    )

    const { result } = renderHook(() => useCms('rich'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.content).toBe(JSON.stringify({ text: 'Rich content', bold: true }))
  })
})
