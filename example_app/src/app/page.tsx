'use client'

import {
  BaseButton,
  BaseCard,
  BaseInput,
  BaseBadge,
  BaseAlert,
  BaseToggle,
  BaseSpinner,
  BaseSkeleton,
  BaseAvatar,
} from '@web-base/base-ui'
import { useState } from 'react'

export default function Home() {
  const [toggled, setToggled] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-8">
        web-base Example App
      </h1>

      <div className="grid gap-8 max-w-4xl">
        {/* Buttons */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseButton
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

        {/* Input */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseInput
          </h2>
          <div className="max-w-sm space-y-4">
            <BaseInput
              label="Email"
              placeholder="you@example.com"
              type="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="We'll never share your email"
            />
            <BaseInput
              label="Password"
              type="password"
              placeholder="Enter password"
              error="Password must be at least 8 characters"
            />
          </div>
        </BaseCard>

        {/* Badges */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseBadge
          </h2>
          <div className="flex flex-wrap gap-2">
            <BaseBadge>Default</BaseBadge>
            <BaseBadge variant="primary">Primary</BaseBadge>
            <BaseBadge variant="success">Success</BaseBadge>
            <BaseBadge variant="warning">Warning</BaseBadge>
            <BaseBadge variant="error">Error</BaseBadge>
          </div>
        </BaseCard>

        {/* Alert */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseAlert
          </h2>
          <div className="space-y-3">
            <BaseAlert variant="info" title="Info" description="This is an info alert." />
            <BaseAlert variant="success" title="Success" description="Action completed successfully." />
            <BaseAlert variant="warning" title="Warning" description="Proceed with caution." />
            <BaseAlert variant="error" title="Error" description="Something went wrong." dismissible />
          </div>
        </BaseCard>

        {/* Toggle */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseToggle
          </h2>
          <BaseToggle
            label="Enable notifications"
            checked={toggled}
            onChange={setToggled}
            helperText="You can change this any time"
          />
        </BaseCard>

        {/* Avatar + Spinner + Skeleton */}
        <BaseCard padding="md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            BaseAvatar / BaseSpinner / BaseSkeleton
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <BaseAvatar fallback="JD" size="xl" />
            <BaseAvatar fallback="AB" size="lg" />
            <BaseAvatar fallback="CD" size="md" />
            <BaseSpinner size="lg" />
            <BaseSpinner size="md" />
            <BaseSpinner size="sm" />
          </div>
          <div className="mt-4 space-y-2">
            <BaseSkeleton variant="text" width="100%" height={16} />
            <BaseSkeleton variant="text" width="80%" height={16} />
            <BaseSkeleton variant="rectangular" width="100%" height={80} />
          </div>
        </BaseCard>
      </div>
    </main>
  )
}
