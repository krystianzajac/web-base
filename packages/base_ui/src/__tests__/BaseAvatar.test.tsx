import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseAvatar } from '../components/BaseAvatar'

describe('BaseAvatar', () => {
  it('renders fallback initials', () => {
    render(<BaseAvatar fallback="John Doe" />)
    expect(screen.getByText('JO')).toBeInTheDocument()
  })

  it('has accessible label on fallback', () => {
    render(<BaseAvatar fallback="Alice" />)
    expect(screen.getByLabelText('Alice')).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders %s size without error', (size) => {
    render(<BaseAvatar fallback="AB" size={size} />)
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('renders without error when src and alt are provided', () => {
    // jsdom does not load images so Radix Avatar always shows the fallback.
    // We verify the component mounts successfully and the fallback is accessible.
    render(
      <BaseAvatar src="https://example.com/avatar.jpg" alt="Profile photo" fallback="PH" />,
    )
    // Fallback is always shown in jsdom; the accessible label uses alt when provided.
    expect(screen.getByLabelText('Profile photo')).toBeInTheDocument()
  })
})
