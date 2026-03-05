import React, { useId } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from '../lib/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface BaseSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

/**
 * Dropdown select built on Radix UI Select.
 * Keyboard navigation and ARIA handled by Radix.
 */
export function BaseSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled,
}: BaseSelectProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-label-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'flex min-h-[44px] w-full items-center justify-between rounded border px-3 py-2',
            'bg-[var(--color-surface)] text-[var(--color-text-primary)] text-body-medium',
            'transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1',
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-divider)] hover:border-[var(--color-text-secondary)]',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <RadixSelect.Value placeholder={<span className="text-[var(--color-text-disabled)]">{placeholder}</span>} />
          <RadixSelect.Icon>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-text-secondary)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded border border-[var(--color-divider)]',
              'bg-[var(--color-surface)] shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
              'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            )}
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'relative flex min-h-[36px] cursor-pointer select-none items-center rounded px-3 py-2',
                    'text-body-medium text-[var(--color-text-primary)]',
                    'outline-none',
                    'data-[highlighted]:bg-[var(--color-primary)] data-[highlighted]:text-white',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} role="alert" className="text-label-small text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  )
}
