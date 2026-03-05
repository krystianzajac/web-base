import * as Sentry from '@sentry/nextjs'

/**
 * Attaches an anonymous user ID to all subsequent Sentry events.
 * Never pass email or PII — only an opaque user ID.
 *
 * @param userId     - Opaque user identifier (UUID, hashed ID, etc.)
 * @param properties - Additional non-PII properties (e.g. role, plan)
 */
export function setUserContext(userId: string, properties?: Record<string, unknown>): void {
  Sentry.setUser({ id: userId, ...properties })
}

/** Clears the user context from Sentry — call on sign out. */
export function clearUserContext(): void {
  Sentry.setUser(null)
}
