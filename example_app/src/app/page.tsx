'use client'

import Link from 'next/link'
import { CmsText } from '@web-base/base-cms'
import { BaseButton, BaseCard } from '@web-base/base-ui'

/**
 * Home page — public, Client Component (CmsText uses hooks).
 * Demonstrates: CMS content with graceful fallback, BaseButton all variants,
 * sign in / sign up navigation.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)]">
      {/* CMS headline — shows fallback gracefully if Supabase not connected */}
      <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-3">
        <CmsText cmsKey="home_welcome" fallback="Welcome to Example App" />
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        <CmsText
          cmsKey="home_tagline"
          fallback="A demonstration of all web-base packages."
        />
      </p>

      {/* Auth navigation */}
      <div className="flex gap-3 mb-12" data-testid="auth-links">
        <Link href="/auth/signin">
          <BaseButton variant="primary">Sign In</BaseButton>
        </Link>
        <Link href="/auth/signup">
          <BaseButton variant="secondary">Sign Up</BaseButton>
        </Link>
      </div>

      {/* BaseButton variant showcase */}
      <div className="grid gap-6 max-w-2xl">
        <BaseCard padding="md">
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseButton — all variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="tertiary">Tertiary</BaseButton>
            <BaseButton variant="destructive">Destructive</BaseButton>
            <BaseButton variant="primary" disabled>Disabled</BaseButton>
            <BaseButton variant="primary" loading>Loading</BaseButton>
          </div>
        </BaseCard>
      </div>
    </main>
  )
}
