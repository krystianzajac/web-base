import React, { Component, type ReactNode, type ErrorInfo } from 'react'

type FallbackProp = ReactNode | ((error: Error) => ReactNode)

export interface ErrorBoundaryProps {
  fallback: FallbackProp
  children: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * React error boundary — catches errors in the subtree and renders a fallback.
 * `fallback` can be a ReactNode or a render function that receives the error.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  render(): ReactNode {
    const { error } = this.state
    const { fallback, children } = this.props

    if (error) {
      return typeof fallback === 'function' ? fallback(error) : fallback
    }

    return children
  }
}
