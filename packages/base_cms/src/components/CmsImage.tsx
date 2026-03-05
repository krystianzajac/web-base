import React from 'react'
import Image from 'next/image'
import { useCms } from '../client/use-cms'

export interface CmsImageProps {
  cmsKey: string
  locale?: string
  alt: string
  /** Rendered while loading or when content is unavailable. */
  fallback?: React.ReactNode
  className?: string
  /**
   * Provide both `width` and `height` for a fixed-size image.
   * Omit both to use `fill` layout (parent must be `position: relative`).
   */
  width?: number
  height?: number
}

/**
 * Renders a Next.js `<Image>` whose URL comes from the CMS.
 *
 * - If `width` and `height` are both provided, renders a fixed-size image.
 * - If neither is provided, renders with `fill` (parent must be `position: relative`).
 * - **Loading / no URL**: renders `fallback` if provided, otherwise nothing.
 */
export function CmsImage({ cmsKey, locale, alt, fallback, className, width, height }: CmsImageProps) {
  const { content, loading } = useCms(cmsKey, locale)

  if (loading || !content) {
    return fallback != null ? <>{fallback}</> : null
  }

  if (width != null && height != null) {
    return (
      <Image
        src={content}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return (
    <Image
      src={content}
      alt={alt}
      fill
      className={className}
    />
  )
}
