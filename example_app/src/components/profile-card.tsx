'use client'

import { useMemo } from 'react'
import { createBrowserApiClient } from '@web-base/base-api'
import { useApiQuery } from '@web-base/base-api'
import { BaseCard, BaseSkeleton, BaseAvatar } from '@web-base/base-ui'
import { apiConfig } from '@/lib/config'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileCardProps {
  /** Profile pre-fetched server-side — shown immediately on hydration. */
  profileFromServer: Profile | null
  userId: string
}

/**
 * ProfileCard — Client Component.
 * Demonstrates: useApiQuery + createBrowserApiClient, BaseSkeleton during
 * client re-fetch, BaseAvatar, BaseCard.
 *
 * The server-rendered profile is shown immediately; the client re-validates
 * in the background so mutations from other tabs are reflected.
 */
export default function ProfileCard({ profileFromServer, userId }: ProfileCardProps) {
  const client = useMemo(() => createBrowserApiClient<Database>(apiConfig), [])

  const { data: result, loading } = useApiQuery(
    ['profile', userId],
    async () => {
      const res = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      return res.data as Profile | null
    },
    {
      // Only set initialData when server profile exists; null would be treated
      // as "data available" by TanStack Query, preventing a client re-fetch.
      ...(profileFromServer !== null ? { initialData: profileFromServer } : {}),
      staleTime: 30_000,
    },
  )

  const profile = result ?? profileFromServer

  if (loading && !profile) {
    return (
      <BaseCard padding="md" className="mt-4">
        <BaseSkeleton variant="text" width="60%" height={20} />
        <BaseSkeleton variant="text" width="40%" height={16} className="mt-2" />
      </BaseCard>
    )
  }

  return (
    <BaseCard padding="md" className="mt-4 flex items-center gap-4">
      <BaseAvatar
        src={profile?.avatar_url ?? undefined}
        fallback={(profile?.display_name?.[0] ?? 'U').toUpperCase()}
        size="lg"
      />
      <div>
        <p
          className="font-semibold text-[var(--color-text-primary)]"
          data-testid="profile-name"
        >
          {profile?.display_name ?? 'Anonymous User'}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]" data-testid="profile-id">
          ID: {userId}
        </p>
      </div>
    </BaseCard>
  )
}
