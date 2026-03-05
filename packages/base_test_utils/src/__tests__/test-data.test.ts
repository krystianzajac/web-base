import { describe, it, expect } from 'vitest'
import { TestData } from '../data/test-data'

describe('TestData', () => {
  describe('user()', () => {
    it('generates unique IDs on each call', () => {
      const a = TestData.user()
      const b = TestData.user()
      expect(a.id).not.toBe(b.id)
    })

    it('applies overrides', () => {
      const user = TestData.user({ displayName: 'Alice', email: 'alice@example.com' })
      expect(user.displayName).toBe('Alice')
      expect(user.email).toBe('alice@example.com')
    })

    it('has sensible defaults', () => {
      const user = TestData.user()
      expect(user.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(user.email).toContain('@example.com')
      expect(user.displayName).toBe('Test User')
      expect(user.avatarUrl).toBeNull()
      expect(user.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('session()', () => {
    it('generates unique tokens on each call', () => {
      const a = TestData.session()
      const b = TestData.session()
      expect(a.token).not.toBe(b.token)
    })

    it('expires approximately 1 hour from now', () => {
      const session = TestData.session()
      const diff = session.expiresAt.getTime() - Date.now()
      expect(diff).toBeGreaterThan(3_500_000)
      expect(diff).toBeLessThan(3_700_000)
    })

    it('applies overrides', () => {
      const userId = 'fixed-user-id'
      const session = TestData.session({ userId })
      expect(session.userId).toBe(userId)
    })
  })

  describe('cmsEntry()', () => {
    it('generates unique keys on each call', () => {
      const a = TestData.cmsEntry()
      const b = TestData.cmsEntry()
      expect(a.key).not.toBe(b.key)
    })

    it('applies overrides', () => {
      const entry = TestData.cmsEntry({ key: 'hero_title', content_json: 'Hello' })
      expect(entry.key).toBe('hero_title')
      expect(entry.content_json).toBe('Hello')
    })
  })
})
