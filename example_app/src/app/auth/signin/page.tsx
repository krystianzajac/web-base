'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@web-base/base-auth'
import { BaseButton, BaseInput, BaseAlert, BaseCard } from '@web-base/base-ui'

/**
 * Sign In page.
 * Demonstrates: BaseInput, BaseButton with loading state, BaseAlert on error,
 * SSO buttons, useAuth hook.
 */
export default function SignInPage() {
  const { signIn, signInWithSSO, error } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')

    if (!email) {
      setEmailError('Email is required')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
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
          Sign In
        </h1>

        {error && (
          <BaseAlert
            variant="error"
            title="Sign in failed"
            description={error}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <BaseInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            aria-label="Email address"
          />
          <BaseInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />

          <BaseButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Sign In
          </BaseButton>
        </form>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-center text-[var(--color-text-secondary)]">or continue with</p>
          <BaseButton
            variant="secondary"
            className="w-full"
            onClick={() => signInWithSSO('google')}
          >
            Google
          </BaseButton>
          <BaseButton
            variant="secondary"
            className="w-full"
            onClick={() => signInWithSSO('github')}
          >
            GitHub
          </BaseButton>
        </div>

        <p className="mt-6 text-sm text-center text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[var(--color-primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </BaseCard>
    </main>
  )
}
