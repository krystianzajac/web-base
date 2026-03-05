import React from 'react'
import { cn } from '../lib/cn'

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export interface BaseSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
  /** Override stroke colour (defaults to currentColor) */
  color?: string
}

/** Animated loading spinner. */
export function BaseSpinner({
  size = 'md',
  color,
  className,
  ...props
}: BaseSpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color ?? 'currentColor'}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color ?? 'currentColor'}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
