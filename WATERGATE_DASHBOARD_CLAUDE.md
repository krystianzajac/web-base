# Watergate Dashboard — CLAUDE.md

## Read first

Before writing any code, read these two documents from the web-base repo
(`github.com/krystianzajac/web-base`):

1. **`CLAUDE.md`** — architecture principles, banned patterns, code quality standards.
   Every rule there applies here unless this file explicitly overrides it.
2. **`IMPLEMENTATION_GUIDE.md`** — step-by-step walkthrough for creating a new app
   on top of web-base (project creation, provider stack, brand config, testing setup,
   pre-ship checklist). Use it as the how-to reference throughout the build.

---

## What This Is

A Next.js web dashboard for the **Watergate Sonic** smart water valve, built on top of
`web-base`. It connects to the Watergate Cloud API to display real-time telemetry,
manage valve state, monitor incidents, and configure property settings.

This is a **consumer of web-base packages** — not a modification of web-base itself.

### Key differences from the web-base example app

The Watergate Cloud API is a plain REST API — not Supabase. This changes two things:

- **No `base_auth`** — Watergate has its own Bearer token / refresh token flow.
  Auth is handled with Next.js Route Handlers that proxy the Watergate auth endpoints
  and set httpOnly cookies. `base_auth` is not installed.
- **No `base_cms`** — no CMS content needed. `base_cms` is not installed.
- **`base_api` used differently** — installed for its error hierarchy (`ApiError` subclasses),
  retry logic (`withRetry`), and TanStack Query hooks (`useApiQuery`, `useApiMutation`).
  The actual HTTP calls go to `api.watergate.ai` through `src/lib/watergate-client.ts`,
  which is this project's equivalent of `createBrowserApiClient`.

---

## Architecture

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| UI | `@web-base/base-ui` — brand tokens + components |
| Query hooks | `@web-base/base-api` — `useApiQuery`, `useApiMutation`, error hierarchy |
| Monitoring | `@web-base/base-monitoring` — Sentry, Logger, Analytics |
| Testing | `@web-base/base-test-utils` — `renderWithBrand`, MSW, `TestData` |
| State | TanStack Query (via `base-api` hooks) |

### Project structure

```
watergate-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # BrandProvider + Providers (client wrapper)
│   │   ├── page.tsx                    # Root — redirects to /dashboard or /auth/signin
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/route.ts      # POST — proxies Watergate login, sets cookies
│   │   │       ├── refresh/route.ts    # POST — proxies token refresh, rotates cookies
│   │   │       └── logout/route.ts     # POST — clears cookies
│   │   ├── auth/
│   │   │   └── signin/page.tsx         # Login form
│   │   └── dashboard/
│   │       ├── layout.tsx              # Protected layout — redirects if no token
│   │       ├── page.tsx                # Overview: sonics list + open incident count
│   │       ├── sonics/
│   │       │   └── [id]/page.tsx       # Single sonic: telemetry + valve control
│   │       ├── incidents/
│   │       │   └── page.tsx            # Incidents list with open/closed filter
│   │       └── settings/
│   │           └── page.tsx            # Property settings + notification toggles
│   ├── lib/
│   │   ├── watergate-client.ts         # Typed HTTP client — the ONLY place fetch() is used
│   │   ├── watergate-types.ts          # TypeScript interfaces for all API models
│   │   └── config.ts                   # Env var accessors
│   ├── hooks/
│   │   ├── use-sonics.ts               # useApiQuery wrappers for Sonic endpoints
│   │   ├── use-incidents.ts            # useApiQuery wrappers for Incident endpoints
│   │   ├── use-telemetry.ts            # Polling telemetry (refetchInterval: 30 s)
│   │   └── use-valve.ts               # useApiMutation for valve open/close
│   ├── components/
│   │   ├── providers.tsx               # 'use client' — ApiQueryProvider wrapper
│   │   ├── sonic-card.tsx              # Valve state + battery + radio signal
│   │   ├── telemetry-panel.tsx         # Pressure, flow, temperature gauges
│   │   ├── incident-badge.tsx          # Severity colour + type label
│   │   ├── valve-control.tsx           # Open/Close with BaseDialog confirmation
│   │   └── nav.tsx                     # Sidebar navigation
│   └── brand.ts                        # AppBrand config
├── instrumentation.ts                  # Sentry init (see IMPLEMENTATION_GUIDE §9)
├── middleware.ts                        # Redirects unauthenticated users
├── next.config.mjs
├── tailwind.config.ts
└── .env.local                          # Never committed — copy from .env.local.example
```

---

## Package installation

```json
// package.json — dependencies
{
  "dependencies": {
    "@web-base/base-ui":         "github:krystianzajac/web-base#main&path=packages/base_ui",
    "@web-base/base-api":        "github:krystianzajac/web-base#main&path=packages/base_api",
    "@web-base/base-monitoring": "github:krystianzajac/web-base#main&path=packages/base_monitoring"
  },
  "devDependencies": {
    "@web-base/base-test-utils": "github:krystianzajac/web-base#main&path=packages/base_test_utils"
  }
}
```

```js
// next.config.mjs — required so Next.js compiles package TypeScript source
const nextConfig = {
  experimental: { instrumentationHook: true },
  transpilePackages: [
    '@web-base/base-ui',
    '@web-base/base-api',
    '@web-base/base-monitoring',
  ],
}
export default nextConfig
```

```ts
// tailwind.config.ts — use the /tailwind sub-path to avoid loading React
// components in the PostCSS context (jiti can't resolve .tsx files)
import { createTailwindConfig } from '@web-base/base-ui/tailwind'
import { watergateBrand } from './src/brand'

export default {
  ...createTailwindConfig(watergateBrand),
  content: ['./src/**/*.{ts,tsx}'],
}
```

---

## Environment variables

```env
# .env.local  (copy from .env.local.example — never commit this file)

# Watergate Cloud API — server-only, no NEXT_PUBLIC_ prefix
# The browser never calls api.watergate.ai directly; all calls go through
# Next.js Route Handlers which add the Bearer token server-side.
WATERGATE_API_BASE_URL=https://api.watergate.ai

# Random 32-byte hex string — used to sign the refresh token cookie
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
WATERGATE_REFRESH_SECRET=your-32-byte-hex-secret-here

# Sentry (optional in development, required in production)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_APP_VERSION=0.1.0
```

---

## Watergate Cloud API

**Base URL:** `https://api.watergate.ai`
**Auth:** `Authorization: Bearer <access_token>`
**API docs:** https://docs.watergate.ai/api/cloud
**OpenAPI spec:** https://docs.watergate.ai/openapi/cloud.openapi.yaml

### Auth flow

```
POST /ape/v1/auth/login     { email, password }  → { access_token, refresh_token }
POST /ape/v1/auth/refresh   { refresh_token }    → { access_token, refresh_token }
POST /ape/v1/auth/logout
```

The browser calls the Next.js Route Handlers (`/api/auth/login` etc.), never the
Watergate API directly. The Route Handlers proxy the request, then store tokens in
httpOnly cookies to prevent XSS access:

- `wg_access`  — short-lived JWT (15 min), httpOnly, Secure, SameSite=Lax
- `wg_refresh` — long-lived token (30 days), httpOnly, Secure, SameSite=Lax

`middleware.ts` reads `wg_access` from the cookie and redirects to `/auth/signin`
if it is absent.

### Endpoints

#### Sonics (the valve device)
```
GET  /ape/v1/sonics                        → paginated Sonic[]
GET  /ape/v1/sonics/{id}                   → Sonic
GET  /ape/v1/sonics/{id}/telemetry         → Telemetry
PUT  /ape/v1/sonics/{id}/valve             body: { action: 'open' | 'close' }
```

#### Incidents (leak / pressure alerts)
```
GET  /ape/v1/incidents                     → paginated Incident[]  (filters: open, type, page)
GET  /ape/v1/incidents/{id}                → Incident
PUT  /ape/v1/incidents/{id}/action         body: { action: string }
GET  /ape/v1/properties/{id}/incidents     → paginated Incident[]
```

#### Properties
```
GET    /ape/v1/properties                  → paginated Property[]
GET    /ape/v1/properties/{id}             → Property
GET    /ape/v1/properties/{id}/settings    → PropertySettings
PUT    /ape/v1/properties/{id}/settings    → PropertySettings
GET    /ape/v1/properties/{id}/notifications → NotificationSettings
PUT    /ape/v1/properties/{id}/notifications → NotificationSettings
```

#### Signals (the hub the Sonic connects to)
```
GET  /ape/v1/signals                       → paginated Signal[]
GET  /ape/v1/signals/{id}                  → Signal
```

---

## TypeScript types

```typescript
// src/lib/watergate-types.ts

export interface Sonic {
  id: string
  name: string
  serial_no: string
  signal_id: string
  status: 'online' | 'offline'
  valve_state: 'open' | 'closed'
  battery: number           // 0–100 %
  radio_connection: boolean
  radio_rssi: number
  created_at: string
}

export interface Telemetry {
  pressure: number          // mbar  → divide by 1000 to display as bar
  water_flow: number        // ml/min → divide by 1000 to display as L/min
  water_temp: number        // °C
  probed_at: number         // Unix timestamp (seconds)
}

export interface Incident {
  id: string
  detected_at: string
  type: string
  state: string
  severity: 'low' | 'medium' | 'high'   // verify exact strings against live API
  open: boolean
  signal_id: string
  sonic_id: string
  possible_actions: string[]
}

export interface Property {
  id: string
  name: string
  address: string
  city: string
  country: string
  postcode: string
  lat: number
  lng: number
  active: boolean
  created_at: string
}

export interface PropertySettings {
  timezone: string
  auto_shut_off: boolean
  pressure_tests_enabled: boolean
  pressure_tests_schedule: string
  webhook_enabled: boolean
  webhook_url: string | null
}

export interface Signal {
  id: string
  name: string
  serial_no: string
  version: string
  cloud_connection: boolean
  boot_time: string
  wifi_rssi: number
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page_number: number
  page_size: number
  total_entries: number
  total_pages: number
}

/** Error thrown by createWatergateClient when the API returns a non-2xx status. */
export class WatergateApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'WatergateApiError'
  }
}
```

---

## Typed API client

`src/lib/watergate-client.ts` is the **only file in the project that is allowed to
call `fetch()` directly**. It plays the same role as `createBrowserApiClient` in
Supabase-backed web-base apps. All hooks and components call this client — never
`fetch()` themselves.

The compliance script (`ci/check_compliance.sh` in web-base) flags raw `fetch()` as
an error. Add an eslint-disable comment on the `fetch` line in this file so the
rule is explicitly acknowledged rather than silently bypassed:

```typescript
// src/lib/watergate-client.ts
import type {
  Sonic, Telemetry, Incident, Property,
  PropertySettings, Signal, PaginatedResponse, WatergateApiError,
} from './watergate-types'

export function createWatergateClient(accessToken: string) {
  const base = process.env.WATERGATE_API_BASE_URL ?? 'https://api.watergate.ai'

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    // eslint-disable-next-line no-restricted-globals -- intentional: this IS the API layer
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...init.headers,
      },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new WatergateApiError(res.status, body.message ?? res.statusText)
    }
    return res.json() as Promise<T>
  }

  return {
    getSonics:    ()                        => request<PaginatedResponse<Sonic>>('/ape/v1/sonics'),
    getSonic:     (id: string)              => request<Sonic>(`/ape/v1/sonics/${id}`),
    getTelemetry: (id: string)              => request<Telemetry>(`/ape/v1/sonics/${id}/telemetry`),
    controlValve: (id: string, action: 'open' | 'close') =>
      request(`/ape/v1/sonics/${id}/valve`, { method: 'PUT', body: JSON.stringify({ action }) }),

    getIncidents:   (params?: { open?: boolean; page?: number }) =>
      request<PaginatedResponse<Incident>>(`/ape/v1/incidents?${new URLSearchParams(params as Record<string, string>)}`),
    getIncident:    (id: string)            => request<Incident>(`/ape/v1/incidents/${id}`),
    actOnIncident:  (id: string, action: string) =>
      request(`/ape/v1/incidents/${id}/action`, { method: 'PUT', body: JSON.stringify({ action }) }),

    getProperties:          ()              => request<PaginatedResponse<Property>>('/ape/v1/properties'),
    getProperty:            (id: string)    => request<Property>(`/ape/v1/properties/${id}`),
    getPropertySettings:    (id: string)    => request<PropertySettings>(`/ape/v1/properties/${id}/settings`),
    updatePropertySettings: (id: string, settings: Partial<PropertySettings>) =>
      request<PropertySettings>(`/ape/v1/properties/${id}/settings`, { method: 'PUT', body: JSON.stringify(settings) }),
  }
}
```

---

## Brand

```typescript
// src/brand.ts
import type { AppBrand } from '@web-base/base-ui'

export const watergateBrand: AppBrand = {
  name: 'Watergate Dashboard',
  primaryColor: '#0077CC',    // Watergate blue — adjust to official brand guidelines
  secondaryColor: '#0A1628',  // deep navy
  errorColor: '#D93025',      // alert red — used for leak / high-severity incidents
  successColor: '#1E8E3E',    // valve open / flow normal
  warningColor: '#F9AB00',    // low battery / weak signal / medium severity
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  logo: '/assets/watergate-logo.svg',
  spacing: 'standard',
  radius: 'medium',
}
```

---

## Telemetry display units

The API returns raw SI units. Convert before displaying:

| Field | API unit | Display | Conversion |
|---|---|---|---|
| `pressure` | mbar | bar | ÷ 1000 |
| `water_flow` | ml/min | L/min | ÷ 1000 |
| `water_temp` | °C | °C | none |
| `probed_at` | Unix seconds | local time | `new Date(probed_at * 1000)` |

Telemetry is polled every 30 seconds:

```typescript
// src/hooks/use-telemetry.ts
export function useTelemetry(sonicId: string, client: ReturnType<typeof createWatergateClient>) {
  return useApiQuery(
    ['telemetry', sonicId],
    () => client.getTelemetry(sonicId),
    { refetchInterval: 30_000, staleTime: 25_000 },
  )
}
```

---

## Key UI components

| Component | Description |
|---|---|
| `SonicCard` | Device name, valve state badge (open=green / closed=red), battery %, radio RSSI |
| `TelemetryPanel` | Three readouts: pressure (bar), flow (L/min), temp (°C); last-updated time |
| `ValveControl` | `BaseButton` (Open or Close) + `BaseDialog` confirmation step — valve is physical, irreversible |
| `IncidentBadge` | Severity chip: low=warning colour, medium=warning+icon, high=error colour |
| `IncidentList` | Filterable list with open/closed toggle and pagination |
| `PropertySettingsForm` | Auto-shut-off toggle, pressure test schedule, webhook URL `BaseInput` |
| `SignalStatus` | Cloud connection dot + WiFi RSSI bar |

---

## Build order

Follow this sequence — each step unblocks the next:

1. `src/lib/watergate-types.ts` — all interfaces + `WatergateApiError`
2. `src/lib/watergate-client.ts` — typed HTTP client
3. `src/brand.ts` + `tailwind.config.ts` — brand tokens
4. `src/app/layout.tsx` + `src/components/providers.tsx` — provider stack
5. `app/api/auth/` Route Handlers — login, refresh, logout
6. `middleware.ts` — cookie guard on `/dashboard/*`
7. `app/auth/signin/page.tsx` — login form (uses `BaseInput`, `BaseButton`, `BaseAlert`)
8. `app/dashboard/page.tsx` — sonics overview (happy path first)
9. `src/hooks/use-sonics.ts` + `SonicCard`
10. `src/hooks/use-telemetry.ts` + `TelemetryPanel`
11. `src/hooks/use-valve.ts` + `ValveControl` (with `BaseDialog` confirmation)
12. Incidents list + incident detail + `actOnIncident`
13. Property settings form
14. `instrumentation.ts` — Sentry init (see IMPLEMENTATION_GUIDE §9)
15. Tests for each hook and component (see Testing section below)

---

## Testing

Watergate API calls are intercepted with MSW. The `WATERGATE_API_BASE_URL`
must be set to a fixed value in the test environment so MSW handlers can match:

```typescript
// src/__tests__/setup.tsx
process.env.WATERGATE_API_BASE_URL = 'https://api.watergate.ai'
```

```typescript
// Example: mock telemetry
import { http, HttpResponse } from 'msw'
import { createMockServer } from '@web-base/base-test-utils'

createMockServer(
  http.get('https://api.watergate.ai/ape/v1/sonics/:id/telemetry', () =>
    HttpResponse.json({
      pressure: 3450,     // 3.45 bar
      water_flow: 0,
      water_temp: 18.5,
      probed_at: Math.floor(Date.now() / 1000),
    })
  ),
)

it('displays pressure in bar', async () => {
  renderWithBrand(<TelemetryPanel sonicId="sonic-1" />)
  await waitFor(() =>
    expect(screen.getByText('3.45 bar')).toBeInTheDocument()
  )
})
```

`createMockServer` auto-registers `beforeAll / afterEach / afterAll`.

For auth-protected components, mock the cookie by setting it in the test request
context or mock the `createWatergateClient` factory directly with `vi.mock`.

---

## Known things to verify against the live API

The following were inferred from the OpenAPI spec and should be confirmed once
you have API access:

1. **Auth endpoint paths** — spec did not include auth endpoints explicitly.
   Verify `/ape/v1/auth/login`, `/ape/v1/auth/refresh`, `/ape/v1/auth/logout`
   are correct (or find the actual paths in the Watergate developer portal).
2. **`Incident.severity` values** — assumed `'low' | 'medium' | 'high'`.
   Confirm the exact strings the API returns.
3. **`Sonic.status` values** — assumed `'online' | 'offline'`. Confirm.
4. **Valve action strings** — assumed `'open' | 'close'`. Confirm against
   `possible_actions` in a live incident response or the spec's enum.

---

## Getting started

```bash
# 1. Create the Next.js project
npx create-next-app@latest watergate-dashboard \
  --typescript --tailwind --app --src-dir --import-alias "@/*"
cd watergate-dashboard

# 2. Add web-base packages (copy the block from Package installation above
#    into package.json, then run:)
npm install

# 3. Create the env file
cp .env.local.example .env.local
# Edit .env.local — add WATERGATE_API_BASE_URL and WATERGATE_REFRESH_SECRET

# 4. Start dev server
npm run dev
# → http://localhost:3000  (redirects to /auth/signin)
```

Refer to **`IMPLEMENTATION_GUIDE.md`** in `github.com/krystianzajac/web-base` for:
- Full provider stack setup (§4)
- Sentry / monitoring wiring (§9)
- Vitest + MSW test setup (§10)
- Pre-ship checklist (§12)
