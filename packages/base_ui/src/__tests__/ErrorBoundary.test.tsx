import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorBoundary } from '../components/ErrorBoundary'

function BrokenComponent(): JSX.Element {
  throw new Error('Test error from BrokenComponent')
}

function SafeComponent() {
  return <div>Safe content</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected error throws in tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary fallback={<p>Error occurred</p>}>
        <SafeComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Safe content')).toBeInTheDocument()
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument()
  })

  it('renders ReactNode fallback when child throws', () => {
    render(
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('Safe content')).not.toBeInTheDocument()
  })

  it('renders function fallback with error when child throws', () => {
    render(
      <ErrorBoundary fallback={(error) => <p>Error: {error.message}</p>}>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Error: Test error from BrokenComponent')).toBeInTheDocument()
  })

  it('calls onError callback when child throws', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary fallback={<p>Error</p>} onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error from BrokenComponent' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    )
  })
})
