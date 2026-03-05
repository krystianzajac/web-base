'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { cn } from '../lib/cn'

type ToastVariant = 'info' | 'success' | 'warning' | 'error'

interface ToastEntry {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  info: 'border-[var(--color-primary)] bg-[var(--color-surface)]',
  success: 'border-[var(--color-success)] bg-[var(--color-surface)]',
  warning: 'border-[var(--color-warning)] bg-[var(--color-surface)]',
  error: 'border-[var(--color-error)] bg-[var(--color-surface)]',
}

const variantIcons: Record<ToastVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

const variantIconStyles: Record<ToastVariant, string> = {
  info: 'text-[var(--color-primary)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-error)]',
}

/**
 * Provides toast notification context. Wrap your app with this.
 * Use `useToast().show()` or the static `BaseToast.show()` to trigger toasts.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev, { id, message, variant, duration }])
    },
    [],
  )

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            duration={toast.duration}
            onOpenChange={(open) => !open && remove(toast.id)}
            className={cn(
              'flex items-start gap-3 rounded border-l-4 p-4 shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full',
              variantStyles[toast.variant],
            )}
            aria-live="polite"
          >
            <span className={cn('text-lg font-bold', variantIconStyles[toast.variant])} aria-hidden="true">
              {variantIcons[toast.variant]}
            </span>
            <RadixToast.Description className="text-body-small text-[var(--color-text-primary)]">
              {toast.message}
            </RadixToast.Description>
            <RadixToast.Close
              aria-label="Dismiss notification"
              className={cn(
                'ml-auto rounded p-0.5 text-[var(--color-text-secondary)]',
                'hover:text-[var(--color-text-primary)] transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              )}
            >
              ×
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

/** Access the show() method for triggering toasts imperatively. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

/**
 * Declarative BaseToast component — renders inline if needed.
 * For imperative usage, use `useToast().show()` or `ToastProvider`.
 */
export interface BaseToastProps {
  message: string
  variant?: ToastVariant
  duration?: number
}

export function BaseToast({ message, variant = 'info', duration = 4000 }: BaseToastProps) {
  return (
    <RadixToast.Root
      duration={duration}
      className={cn(
        'flex items-start gap-3 rounded border-l-4 p-4 shadow-md',
        variantStyles[variant],
      )}
      aria-live="polite"
    >
      <span className={cn('text-lg font-bold', variantIconStyles[variant])} aria-hidden="true">
        {variantIcons[variant]}
      </span>
      <RadixToast.Description className="text-body-small text-[var(--color-text-primary)]">
        {message}
      </RadixToast.Description>
    </RadixToast.Root>
  )
}
