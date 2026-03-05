import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@web-base/base-auth/server'
import { createMiddlewareApiClient } from '@web-base/base-api'
import { authConfig, apiConfig } from '@/lib/config'

/**
 * Refreshes the auth session on every request and protects /dashboard/* routes.
 *
 * - Uses `updateSession` (base_auth) to refresh session tokens in cookies.
 * - Uses `createMiddlewareApiClient` (base_api) to check authenticated user.
 * - Redirects unauthenticated requests to /auth/signin for protected routes.
 */
export async function middleware(request: NextRequest) {
  // Refresh session tokens and collect cookies to forward
  const sessionResult = await updateSession(request, authConfig)

  // Protect dashboard routes — check authenticated user
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const { client } = createMiddlewareApiClient(request, apiConfig)
    const {
      data: { user },
    } = await client.auth.getUser()

    if (!user) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  const response = NextResponse.next({ request })
  sessionResult.cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options ?? {})
  })
  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
