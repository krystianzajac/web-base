import React from 'react'
import { cn } from '../lib/cn'

export interface BaseInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Labelled text input with optional error and helper text.
 * All colours come from CSS variable tokens.
 */
export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, error, helperText, id, className, disabled, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'min-h-[44px] w-full rounded border px-3 py-2',
            'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
            'text-body-medium placeholder:text-[var(--color-text-disabled)]',
            'transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1',
            error
              ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]'
              : 'border-[var(--color-divider)] hover:border-[var(--color-text-secondary)]',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-label-small text-[var(--color-error)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-label-small text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

BaseInput.displayName = 'BaseInput'
