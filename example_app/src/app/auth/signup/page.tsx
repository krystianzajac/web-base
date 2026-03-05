'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@web-base/base-auth'
import { BaseButton, BaseInput, BaseAlert, BaseCard } from '@web-base/base-ui'

/**
 * Sign Up page.
 * Demonstrates: BaseInput, BaseButton, BaseAlert on error, useAuth.signUp.
 */
export default function SignUpPage() {
  const { signUp, error } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, displayName)
      router.push('/dashboard')
    } catch {
      // error is surfaced via useAuth().error
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
      <BaseCard padding="lg" className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          Create Account
        </h1>

        {error && (
          <BaseAlert
            variant="error"
            title="Sign up failed"
            description={error}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <BaseInput
            label="Display Name"
            type="text"
            placeholder="Alice"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            aria-label="Display name"
          />
          <BaseInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <BaseInput
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            aria-label="Password"
          />

          <BaseButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Create Account
          </BaseButton>
        </form>

        <p className="mt-6 text-sm text-center text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </BaseCard>
    </main>
  )
}
