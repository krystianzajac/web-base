import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const DEFAULT_QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 60 seconds
      gcTime: 5 * 60 * 1000,      // 5 minutes
      retry: false,
    },
  },
})

interface ApiQueryProviderProps {
  children: React.ReactNode
  /** Provide a custom QueryClient (useful in tests). */
  client?: QueryClient
}

/**
 * Wraps children in a TanStack QueryClientProvider.
 * Place this near the root of your app, inside BrandProvider.
 */
export function ApiQueryProvider({ children, client }: ApiQueryProviderProps) {
  return (
    <QueryClientProvider client={client ?? DEFAULT_QUERY_CLIENT}>
      {children}
    </QueryClientProvider>
  )
}
