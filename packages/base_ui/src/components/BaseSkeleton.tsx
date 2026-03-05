import React from 'react'
import { cn } from '../lib/cn'

export interface BaseSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string
  height?: number | string
  variant?: 'text' | 'circular' | 'rectangular'
}

/** Shimmer loading placeholder. */
export function BaseSkeleton({
  width,
  height,
  variant = 'rectangular',
  className,
  style,
  ...props
}: BaseSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse bg-[var(--color-divider)]',
        variant === 'text' && 'rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded',
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  )
}
