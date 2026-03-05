import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeDefaultQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
      },
    },
  })
}

interface ApiQueryProviderProps {
  children: React.ReactNode
  /** Provide a custom QueryClient (useful in tests). */
  client?: QueryClient
}

/**
 * Wraps children in a TanStack QueryClientProvider.
 * Place this near the root of your app, inside BrandProvider.
 *
 * Uses useState(() => ...) to create the QueryClient once per component tree,
 * which prevents state leaking between tests (unlike a module-level singleton).
 */
export function ApiQueryProvider({ children, client }: ApiQueryProviderProps) {
  // useState with a function initializer runs only once — the correct pattern
  // for lazy singleton initialization that's also lint-safe
  const [defaultClient] = useState<QueryClient>(() => makeDefaultQueryClient())

  return (
    <QueryClientProvider client={client ?? defaultClient}>
      {children}
    </QueryClientProvider>
  )
}
