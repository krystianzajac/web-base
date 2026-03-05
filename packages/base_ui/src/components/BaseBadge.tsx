import React from 'react'
import { cn } from '../lib/cn'

const variantStyles = {
  default: 'bg-[var(--color-divider)] text-[var(--color-text-secondary)]',
  primary: 'bg-[var(--color-primary)] text-white',
  success: 'bg-[var(--color-success)] text-white',
  warning: 'bg-[var(--color-warning)] text-white',
  error: 'bg-[var(--color-error)] text-white',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-label-small',
  md: 'px-2.5 py-1 text-label-medium',
}

export interface BaseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles
  size?: 'sm' | 'md'
}

/** Inline status badge. */
export function BaseBadge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BaseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
