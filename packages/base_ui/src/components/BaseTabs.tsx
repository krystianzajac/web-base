import React from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '../lib/cn'

export interface BaseTabItem {
  value: string
  label: string
  disabled?: boolean
}

export interface BaseTabsProps {
  tabs: BaseTabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

/** Accessible tab container built on Radix Tabs. */
export function BaseTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: BaseTabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <RadixTabs.List
        className={cn(
          'flex border-b border-[var(--color-divider)]',
          'overflow-x-auto',
        )}
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'min-h-[44px] px-4 py-2 text-label-medium font-medium',
              'border-b-2 border-transparent transition-colors duration-fast',
              'text-[var(--color-text-secondary)]',
              'hover:text-[var(--color-text-primary)]',
              'data-[state=active]:border-[var(--color-primary)]',
              'data-[state=active]:text-[var(--color-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export interface BaseTabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

/** Tab panel content area. Must be a child of BaseTabs. */
export function BaseTabPanel({ value, children, className }: BaseTabPanelProps) {
  return (
    <RadixTabs.Content
      value={value}
      className={cn('py-4 focus-visible:outline-none', className)}
    >
      {children}
    </RadixTabs.Content>
  )
}
