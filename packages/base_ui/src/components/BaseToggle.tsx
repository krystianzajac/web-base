import React, { useId } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { cn } from '../lib/cn'

export interface BaseToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  helperText?: string
}

/**
 * Labelled toggle switch built on Radix UI Switch.
 */
export function BaseToggle({
  label,
  checked,
  onChange,
  disabled,
  helperText,
}: BaseToggleProps) {
  const id = useId()
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Switch.Root
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-describedby={helperId}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked
              ? 'bg-[var(--color-primary)]'
              : 'bg-[var(--color-divider)]',
          )}
        >
          <Switch.Thumb
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg',
              'ring-0 transition-transform duration-fast',
              checked ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </Switch.Root>
        <label
          htmlFor={id}
          className={cn(
            'text-label-medium text-[var(--color-text-primary)] select-none',
            disabled && 'opacity-50',
          )}
        >
          {label}
        </label>
      </div>
      {helperText && (
        <p id={helperId} className="ml-14 text-label-small text-[var(--color-text-secondary)]">
          {helperText}
        </p>
      )}
    </div>
  )
}
