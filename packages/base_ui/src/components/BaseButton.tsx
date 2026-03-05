import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'
import { BaseSpinner } from './BaseSpinner'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'min-h-[44px]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-primary)] text-white',
          'hover:opacity-90 active:opacity-80',
        ],
        secondary: [
          'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent',
          'hover:bg-[var(--color-primary)] hover:text-white active:opacity-80',
        ],
        tertiary: [
          'text-[var(--color-primary)] bg-transparent',
          'hover:underline active:opacity-70',
        ],
        destructive: [
          'bg-[var(--color-error)] text-white',
          'hover:opacity-90 active:opacity-80',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-label-small rounded',
        md: 'h-11 px-5 text-label-medium rounded',
        lg: 'h-13 px-7 text-label-large rounded',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show a loading spinner and disable interaction */
  loading?: boolean
}

/**
 * Primary interactive button.
 * All variants consume CSS variable tokens — no hardcoded colours.
 */
export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ variant, size, loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <BaseSpinner size="sm" aria-hidden="true" />}
        {children}
      </button>
    )
  },
)

BaseButton.displayName = 'BaseButton'
