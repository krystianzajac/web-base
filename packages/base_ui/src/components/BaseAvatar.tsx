import React from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '../lib/cn'

const sizeMap = {
  sm: 'h-8 w-8 text-label-small',
  md: 'h-10 w-10 text-label-medium',
  lg: 'h-14 w-14 text-title-small',
  xl: 'h-20 w-20 text-title-large',
}

export interface BaseAvatarProps {
  src?: string
  alt?: string
  /** Initials shown when image fails to load */
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/** User avatar with image fallback to initials. */
export function BaseAvatar({
  src,
  alt,
  fallback,
  size = 'md',
}: BaseAvatarProps) {
  return (
    <RadixAvatar.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        sizeMap[size],
      )}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={alt ?? fallback}
          className="h-full w-full object-cover"
        />
      )}
      <RadixAvatar.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full font-semibold',
          'bg-[var(--color-primary)] text-white',
        )}
        aria-label={alt ?? fallback}
      >
        {fallback.slice(0, 2).toUpperCase()}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}
