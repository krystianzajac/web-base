import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw-server'
import { createServerCmsClient } from '../server/create-server-cms-client'
import type { CmsConfig } from '../types/cms-config'
import type { ServerCookieStore } from '@web-base/base-api'

const TEST_URL = 'https://test.supabase.co'
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6OTk5OTk5OTk5OX0.test'
const CMS_ENDPOINT = `${TEST_URL}/rest/v1/cms_content`

const CONFIG: CmsConfig = {
  supabaseUrl: TEST_URL,
  supabaseAnonKey: TEST_KEY,
  appId: 'test-app',
  defaultLocale: 'en',
  cacheTtlMs: 300_000,
  fallbackToDefaultLocale: true,
}

const MOCK_COOKIE_STORE: ServerCookieStore = { getAll: () => [] }

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getCmsContent', () => {
  it('returns content string when the row exists', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: 'Server welcome' }]),
      ),
    )

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.getCmsContent('welcome', 'en')

    expect(result).toBe('Server welcome')
  })

  it('returns null when the key does not exist', async () => {
    server.use(http.get(CMS_ENDPOINT, () => HttpResponse.json([])))

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.getCmsContent('missing', 'en')

    expect(result).toBeNull()
  })

  it('JSON.stringifies object content_json', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: { title: 'Rich', bold: true } }]),
      ),
    )

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.getCmsContent('rich', 'en')

    expect(result).toBe(JSON.stringify({ title: 'Rich', bold: true }))
  })
})

describe('preloadCms — single query for all keys', () => {
  it('issues exactly ONE Supabase request regardless of how many keys are requested', async () => {
    let requestCount = 0

    server.use(
      http.get(CMS_ENDPOINT, () => {
        requestCount++
        return HttpResponse.json([
          { key: 'hero_title', content_json: 'Hero Title' },
          { key: 'hero_body', content_json: 'Hero Body' },
          { key: 'cta_label', content_json: 'Get Started' },
        ])
      }),
    )

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.preloadCms(['hero_title', 'hero_body', 'cta_label'], 'en')

    expect(requestCount).toBe(1)
    expect(result).toEqual({
      hero_title: 'Hero Title',
      hero_body: 'Hero Body',
      cta_label: 'Get Started',
    })
  })

  it('returns empty map when no keys are provided', async () => {
    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.preloadCms([], 'en')
    expect(result).toEqual({})
  })
})

describe('getCmsJson', () => {
  it('returns parsed typed object', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: { headline: 'Hello', body: 'World' } }]),
      ),
    )

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.getCmsJson<{ headline: string; body: string }>('hero', 'en')

    expect(result).toEqual({ headline: 'Hello', body: 'World' })
  })

  it('returns null for malformed JSON string content', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: '{{not json' }]),
      ),
    )

    const cms = createServerCmsClient(MOCK_COOKIE_STORE, CONFIG)
    const result = await cms.getCmsJson<{ headline: string }>('broken', 'en')

    expect(result).toBeNull()
  })
})
