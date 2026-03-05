import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from '../lib/cn'

export interface BaseDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Modal dialog built on Radix UI Dialog primitive.
 * Keyboard navigation and focus trapping handled by Radix.
 */
export function BaseDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: BaseDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            'fixed inset-0 z-40',
            'bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded bg-[var(--color-surface)] p-6 shadow-lg',
            'focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <RadixDialog.Title className="text-title-large text-[var(--color-text-primary)]">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-1 text-body-medium text-[var(--color-text-secondary)]">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label="Close dialog"
              className={cn(
                'ml-4 rounded p-1 text-[var(--color-text-secondary)]',
                'hover:text-[var(--color-text-primary)] hover:bg-[var(--color-divider)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                'transition-colors duration-fast',
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </RadixDialog.Close>
          </div>

          {children && (
            <div className="text-body-medium text-[var(--color-text-primary)]">
              {children}
            </div>
          )}

          {footer && (
            <div className="mt-6 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
