import React from 'react'
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { screen, waitFor } from '@testing-library/react'
import {
  renderWithBrand,
  createSupabaseMockHandlers,
} from '@web-base/base-test-utils'
import ProfileCard from '../components/profile-card'

const TEST_URL = 'https://placeholder.supabase.co'

const mockProfile = {
  id: 'user-123',
  display_name: 'Alice Smith',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const server = setupServer(
  ...createSupabaseMockHandlers('profiles', { rows: [mockProfile] }, TEST_URL),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ProfileCard', () => {
  it('shows profile name passed from server immediately (no loading flash)', () => {
    renderWithBrand(
      <ProfileCard profileFromServer={mockProfile} userId="user-123" />,
    )
    // Server data is visible instantly via initialData
    expect(screen.getByTestId('profile-name')).toHaveTextContent('Alice Smith')
  })

  it('shows profile name after client fetch when profileFromServer is null', async () => {
    renderWithBrand(
      <ProfileCard profileFromServer={null} userId="user-123" />,
    )
    // Skeleton shown initially, then MSW returns mockProfile
    await waitFor(
      () => expect(screen.getByTestId('profile-name')).toBeInTheDocument(),
      { timeout: 3000 },
    )
  })

  it('shows userId in the card', () => {
    renderWithBrand(
      <ProfileCard profileFromServer={mockProfile} userId="user-123" />,
    )
    expect(screen.getByTestId('profile-id')).toHaveTextContent('user-123')
  })

  it('shows MSW-returned profile name after client re-fetch', async () => {
    renderWithBrand(
      <ProfileCard profileFromServer={null} userId="user-123" />,
    )
    await waitFor(
      () => expect(screen.getByTestId('profile-name')).toHaveTextContent('Alice Smith'),
      { timeout: 3000 },
    )
  })
})
