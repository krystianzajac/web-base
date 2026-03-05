import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CmsText } from '../components/CmsText'

// Mock useCms so CmsText tests don't need CmsProvider or MSW
vi.mock('../client/use-cms', () => ({
  useCms: vi.fn(),
}))

import { useCms } from '../client/use-cms'
const mockUseCms = vi.mocked(useCms)

describe('CmsText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows BaseSkeleton (role="status") while loading with no fallback', () => {
    mockUseCms.mockReturnValue({ content: null, loading: true, error: null })

    render(<CmsText cmsKey="welcome" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows fallback text while loading when fallback is provided', () => {
    mockUseCms.mockReturnValue({ content: null, loading: true, error: null })

    render(<CmsText cmsKey="welcome" fallback="Loading…" />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders content when loaded', () => {
    mockUseCms.mockReturnValue({ content: 'Hello, World!', loading: false, error: null })

    render(<CmsText cmsKey="welcome" />)

    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('applies className to the content span', () => {
    mockUseCms.mockReturnValue({ content: 'Styled', loading: false, error: null })

    render(<CmsText cmsKey="welcome" className="text-xl font-bold" />)

    const el = screen.getByText('Styled')
    expect(el).toHaveClass('text-xl', 'font-bold')
  })

  it('shows fallback on error', () => {
    mockUseCms.mockReturnValue({ content: null, loading: false, error: 'Network error' })

    render(<CmsText cmsKey="welcome" fallback="Default text" />)

    expect(screen.getByText('Default text')).toBeInTheDocument()
  })

  it('renders nothing on error when no fallback is provided', () => {
    mockUseCms.mockReturnValue({ content: null, loading: false, error: 'Network error' })

    const { container } = render(<CmsText cmsKey="welcome" />)

    expect(container.firstChild).toBeNull()
  })
})
