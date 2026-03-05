'use client'

import React, { useState } from 'react'
import { cn } from '../lib/cn'

const variantConfig = {
  info: {
    container: 'border-[var(--color-primary)] bg-[var(--color-primary)]/10',
    icon: 'ℹ',
    iconClass: 'text-[var(--color-primary)]',
  },
  success: {
    container: 'border-[var(--color-success)] bg-[var(--color-success)]/10',
    icon: '✓',
    iconClass: 'text-[var(--color-success)]',
  },
  warning: {
    container: 'border-[var(--color-warning)] bg-[var(--color-warning)]/10',
    icon: '⚠',
    iconClass: 'text-[var(--color-warning)]',
  },
  error: {
    container: 'border-[var(--color-error)] bg-[var(--color-error)]/10',
    icon: '✕',
    iconClass: 'text-[var(--color-error)]',
  },
}

export interface BaseAlertProps {
  variant?: keyof typeof variantConfig
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
}

/** Inline alert banner with optional dismiss button. */
export function BaseAlert({
  variant = 'info',
  title,
  description,
  dismissible,
  onDismiss,
}: BaseAlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = variantConfig[variant]

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded border-l-4 p-4',
        config.container,
      )}
    >
      <span className={cn('text-lg font-bold shrink-0', config.iconClass)} aria-hidden="true">
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-label-medium font-semibold text-[var(--color-text-primary)]">
            {title}
          </p>
        )}
        {description && (
          <p className="mt-0.5 text-body-small text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={handleDismiss}
          className={cn(
            'ml-auto shrink-0 rounded p-0.5',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            'transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}
