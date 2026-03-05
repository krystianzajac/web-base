import React from 'react'
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from './msw-server'
import { createBrowserApiClient } from '@web-base/base-api'
import { CmsProvider } from '../client/cms-context'
import { useCmsJson } from '../client/use-cms-json'
import type { CmsConfig } from '../types/cms-config'

const TEST_URL = 'https://test.supabase.co'
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6OTk5OTk5OTk5OX0.test'
const CMS_ENDPOINT = `${TEST_URL}/rest/v1/cms_content`

const CONFIG: CmsConfig = {
  supabaseUrl: TEST_URL,
  supabaseAnonKey: TEST_KEY,
  appId: 'test-app',
  defaultLocale: 'en',
  cacheTtlMs: 300_000,
  fallbackToDefaultLocale: false,
}

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

interface Hero {
  headline: string
  body: string
}

describe('useCmsJson — parses JSON object', () => {
  it('returns typed data when content_json is a JSON object', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: { headline: 'Hello', body: 'World' } }]),
      ),
    )

    const { result } = renderHook(() => useCmsJson<Hero>('home_hero'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ headline: 'Hello', body: 'World' })
    expect(result.current.error).toBeNull()
  })
})

describe('useCmsJson — handles malformed JSON gracefully (returns null, not throw)', () => {
  it('returns data: null when content_json is a malformed JSON string', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        // Supabase passes this string through as-is; parseJson will try JSON.parse and fail
        HttpResponse.json([{ content_json: '{{not valid json' }]),
      ),
    )

    const { result } = renderHook(() => useCmsJson<Hero>('broken'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns data: null when content_json is null', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () =>
        HttpResponse.json([{ content_json: null }]),
      ),
    )

    const { result } = renderHook(() => useCmsJson<Hero>('null_key'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
  })
})

describe('useCmsJson — key not found', () => {
  it('returns data: null when no row is found', async () => {
    server.use(
      http.get(CMS_ENDPOINT, () => HttpResponse.json([])),
    )

    const { result } = renderHook(() => useCmsJson<Hero>('missing'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
