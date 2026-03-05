import type { User, Session } from '@web-base/base-auth'
import type { CmsEntry } from '@web-base/base-cms'

/**
 * Generates typed test fixtures with unique IDs. All fields have sensible
 * defaults and every field is overridable.
 *
 * @example
 * ```ts
 * const user = TestData.user({ displayName: 'Alice' })
 * const session = TestData.session({ userId: user.id })
 * const entry = TestData.cmsEntry({ key: 'hero_title', content_json: 'Hello' })
 * ```
 */
export const TestData = {
  user(overrides?: Partial<User>): User {
    return {
      id: crypto.randomUUID(),
      email: `user-${crypto.randomUUID()}@example.com`,
      displayName: 'Test User',
      avatarUrl: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    }
  },

  session(overrides?: Partial<Session>): Session {
    return {
      token: `test-token-${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 3_600_000), // 1 hour from now
      userId: crypto.randomUUID(),
      ...overrides,
    }
  },

  cmsEntry(overrides?: Partial<CmsEntry>): CmsEntry {
    return {
      id: crypto.randomUUID(),
      app_id: 'test-app',
      key: `key-${crypto.randomUUID()}`,
      locale: 'en',
      content_json: 'Test content',
      version: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides,
    }
  },
}
