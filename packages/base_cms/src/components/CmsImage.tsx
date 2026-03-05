import React, { useState } from 'react'
import { useCms } from '../client/use-cms'

export interface CmsImageProps {
  cmsKey: string
  locale?: string
  alt: string
  /** Rendered on load error or when content is unavailable. */
  fallback?: React.ReactNode
  className?: string
  width?: number
  height?: number
}

/**
 * Renders an image whose URL comes from the CMS.
 *
 * Uses a standard `<img>` element. For Next.js image optimisation, wrap the
 * returned URL in `next/image` at the app level.
 *
 * - **Loading / no URL**: renders `fallback` if provided, otherwise nothing.
 * - **Loaded**: renders `<img>` with the CMS URL.
 * - **Image load error**: falls back to `fallback`.
 */
export function CmsImage({ cmsKey, locale, alt, fallback, className, width, height }: CmsImageProps) {
  const { content, loading } = useCms(cmsKey, locale)
  const [imgError, setImgError] = useState(false)

  if (loading || !content || imgError) {
    return fallback != null ? <>{fallback}</> : null
  }

  return (
    <img
      src={content}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setImgError(true)}
    />
  )
}
