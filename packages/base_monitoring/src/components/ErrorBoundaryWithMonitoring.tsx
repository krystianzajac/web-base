import { Component, type ReactNode, type ErrorInfo } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  /** Rendered when an error is caught. */
  fallback: ReactNode
  children: ReactNode
  /** Optional callback invoked after the error is captured. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
}

/**
 * React error boundary that captures exceptions to Sentry.
 *
 * @example
 * ```tsx
 * <ErrorBoundaryWithMonitoring fallback={<p>Something went wrong.</p>}>
 *   <MyComponent />
 * </ErrorBoundaryWithMonitoring>
 * ```
 */
export class ErrorBoundaryWithMonitoring extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    })
    this.props.onError?.(error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
