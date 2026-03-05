import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerApiClient } from '@web-base/base-api'
import { getServerSession } from '@web-base/base-auth/server'
import { apiConfig, authConfig } from '@/lib/config'
import type { Database } from '@/lib/database.types'
import ProfileCard from '@/components/profile-card'

/**
 * Dashboard page — protected Server Component.
 *
 * Demonstrates:
 * - getServerSession for auth check (redirects if unauthenticated)
 * - createServerApiClient<Database> for type-safe, cookie-aware data fetching
 * - Passing server-fetched data as props to Client Components (no double-fetch)
 */
export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = await getServerSession(cookieStore, authConfig)

  if (!session) {
    redirect('/auth/signin')
  }

  const client = createServerApiClient<Database>(cookieStore, apiConfig)
  const { data: profileResult } = await client
    .from('profiles')
    .select('*')
    .eq('id', session.userId)
    .maybeSingle()

  const profile = (profileResult as Database['public']['Tables']['profiles']['Row'] | null)

  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        Welcome back, {profile?.display_name ?? 'User'}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-6">
        Your personal dashboard
      </p>

      {/* ProfileCard re-validates client-side; server data shown immediately */}
      <ProfileCard profileFromServer={profile} userId={session.userId} />

      <nav className="mt-8 flex gap-4">
        <a
          href="/dashboard/settings"
          className="text-[var(--color-primary)] hover:underline"
        >
          Settings
        </a>
        <a
          href="/dashboard/chat"
          className="text-[var(--color-primary)] hover:underline"
        >
          Chat
        </a>
      </nav>
    </main>
  )
}
