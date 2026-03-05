'use client'

import { useAuth } from '@web-base/base-auth'
import { useBrand } from '@web-base/base-ui'
import { BaseButton, BaseCard, BaseToggle, BaseAvatar, BaseAlert } from '@web-base/base-ui'
import { ErrorBoundaryWithMonitoring } from '@web-base/base-monitoring'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Settings page — protected Client Component.
 * Demonstrates: dark mode toggle, sign out, error boundary for demo purposes.
 */
export default function SettingsPage() {
  const { user, signOut, error } = useAuth()
  const { isDark, toggleDark } = useBrand()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

      {error && (
        <BaseAlert variant="error" title="Error" description={error} />
      )}

      {/* User info */}
      <BaseCard padding="md" className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Account
        </h2>
        <div className="flex items-center gap-3">
          <BaseAvatar
            fallback={(user?.displayName?.[0] ?? 'U').toUpperCase()}
            size="md"
          />
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">
              {user?.displayName ?? 'Anonymous'}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
          </div>
        </div>
      </BaseCard>

      {/* Dark mode toggle */}
      <BaseCard padding="md" className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Appearance
        </h2>
        <BaseToggle
          label="Dark mode"
          checked={isDark}
          onChange={toggleDark}
          helperText="Toggles data-theme on the html element"
        />
      </BaseCard>

      {/* Error boundary demo */}
      <BaseCard padding="md" className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Error Boundary Demo
        </h2>
        <ErrorBoundaryWithMonitoring fallback={
          <BaseAlert
            variant="error"
            title="Something went wrong"
            description="The error was captured by ErrorBoundaryWithMonitoring."
          />
        }>
          <ErrorTrigger />
        </ErrorBoundaryWithMonitoring>
      </BaseCard>

      <BaseButton
        variant="destructive"
        loading={signingOut}
        onClick={handleSignOut}
      >
        Sign Out
      </BaseButton>
    </main>
  )
}

/** Demo component — renders a button that throws to trigger the error boundary. */
function ErrorTrigger() {
  const [shouldThrow, setShouldThrow] = useState(false)
  if (shouldThrow) throw new Error('Demo error — caught by ErrorBoundaryWithMonitoring')
  return (
    <BaseButton variant="secondary" onClick={() => setShouldThrow(true)}>
      Trigger Error
    </BaseButton>
  )
}
