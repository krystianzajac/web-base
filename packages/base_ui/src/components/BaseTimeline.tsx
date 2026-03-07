import React from 'react'
import { cn } from '../lib/cn'

const variantColors = {
  default: 'bg-[var(--color-divider)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
}

export interface BaseTimelineItem {
  id: string
  title: string
  description?: string
  timestamp?: string
  icon?: React.ReactNode
  variant?: keyof typeof variantColors
}

export interface BaseTimelineProps {
  items: BaseTimelineItem[]
  className?: string
}

/** Vertical timeline for audit trails and activity logs. */
export function BaseTimeline({ items, className }: BaseTimelineProps) {
  return (
    <div className={cn('relative', className)} role="list">
      {items.map((item, index) => {
        const variant = item.variant ?? 'default'
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="relative flex gap-4 pb-6" role="listitem">
            {/* Connector line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-[var(--color-divider)]"
                aria-hidden="true"
              />
            )}

            {/* Circle indicator */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                variantColors[variant],
                variant !== 'default' && 'text-white',
                variant === 'default' && 'text-[var(--color-text-secondary)]',
              )}
              aria-hidden="true"
            >
              {item.icon ?? (
                <div className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p className="text-body-medium font-medium text-[var(--color-text-primary)]">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-1 text-body-small text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              )}
              {item.timestamp && (
                <p className="mt-1 text-label-small text-[var(--color-text-disabled)]">
                  {item.timestamp}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
