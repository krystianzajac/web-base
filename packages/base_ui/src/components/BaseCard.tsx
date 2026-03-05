import React from 'react'
import { cn } from '../lib/cn'

const paddingMap = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

const shadowMap = {
  none: '',
  subtle: 'shadow-sm',
  medium: 'shadow-md',
  strong: 'shadow-lg',
}

export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'subtle' | 'medium' | 'strong'
}

/**
 * Surface container with brand radius and optional shadow.
 */
export function BaseCard({
  padding = 'md',
  shadow = 'none',
  className,
  children,
  ...props
}: BaseCardProps) {
  return (
    <div
      className={cn(
        'rounded bg-[var(--color-surface)]',
        'border border-[var(--color-divider)]',
        paddingMap[padding],
        shadowMap[shadow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
