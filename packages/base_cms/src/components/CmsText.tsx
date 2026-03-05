import React from 'react'
import { BaseSkeleton } from '@web-base/base-ui'
import { useCms } from '../client/use-cms'

export interface CmsTextProps {
  cmsKey: string
  locale?: string
  /** Shown while loading (instead of BaseSkeleton) and on error. */
  fallback?: string
  className?: string
}

/**
 * Renders a CMS string value as a `<span>`.
 *
 * - **Loading**: shows `fallback` if provided, otherwise `<BaseSkeleton variant="text">`.
 * - **Loaded**: renders the content string.
 * - **Error / not found**: shows `fallback` if provided, otherwise renders nothing.
 *
 * @example
 * ```tsx
 * <CmsText cmsKey="welcome_headline" locale="en" className="text-2xl font-bold" />
 * ```
 */
export function CmsText({ cmsKey, locale, fallback, className }: CmsTextProps) {
  const { content, loading, error } = useCms(cmsKey, locale)

  if (loading) {
    if (fallback !== undefined) {
      return <span className={className}>{fallback}</span>
    }
    return <BaseSkeleton variant="text" className={className} />
  }

  if (error !== null || content === null) {
    if (fallback !== undefined) {
      return <span className={className}>{fallback}</span>
    }
    return null
  }

  return <span className={className}>{content}</span>
}
