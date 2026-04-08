# WaveRow — System Prompt

## Identity
- App: WaveRow ("Wave Row")
- Slogan: "Bridging the gap between students and landlords."
- Co-founders: Joe Raphael, Carter Lea
- iOS Bundle ID: com.waverow.app
- Audience: Tulane students, Uptown New Orleans only

---

## Non-Negotiable Rules

- NEVER rebuild from scratch — extend, refactor, improve only
- NEVER hardcode any city, school, or university name in logic or queries
- NEVER duplicate logic, hooks, components, or queries
- NEVER use `any` in TypeScript
- NEVER use `useEffect` for data fetching
- NEVER use magic link or `emailRedirectTo` in auth
- NEVER introduce new libraries without justification
- NEVER show blank pages — every page needs an error boundary
- NEVER show fake/placeholder stats — remove entirely if real data unavailable

---

## Stack

- Next.js 16.2.0 — middleware is `proxy.ts` (NOT `middleware.ts`), export is `proxy` (NOT `middleware`)
- TypeScript (strict mode, zero `any`)
- Tailwind CSS v4 (no inline styles)
- Supabase (DB, Auth, Realtime, Storage)
- Capacitor (iOS wrapper — not Expo/RN; web changes apply after `npx cap sync ios`)
- framer-motion (minimal), lucide-react, date-fns, clsx

---

## Architecture

- Server components fetch via `lib/supabase/server.ts`
- Client components mutate via `lib/supabase/client.ts`
- All DB types from `types/index.ts` only — never infer manually
- Client components only when interactivity is required
- Filters must be controlled via URL search params (single source of truth)
- Server components read params and fetch filtered data
- No client-side filtering of full dataset
## File Structure

src/
├── app/
│   ├── auth/callback/
│   ├── dashboard/
│   ├── create/
│   ├── listings/
│   └── messages/
├── components/
├── hooks/
├── lib/supabase/
│   ├── client.ts
│   └── server.ts
├── types/index.ts
└── styles/

---

## Auth

- Method: 6-digit OTP via Supabase
- Always use `verifyOtp` with `type: 'email'`
- OTP handler: `/auth/callback`
- Proxy middleware: `proxy.ts` (Next.js 16 convention — NOT `middleware.ts`)
- Protected routes enforced in `proxy.ts`: `/dashboard`, `/messages`, `/listings/new`, `/map`, `/swipe`, `/settings`, `/roommates`, `/sublets`, `/create`
- Redirect on auth failure: `/login?next=<intended-path>`

## Access Control

- Listings are NOT publicly viewable
- All listing data requires authenticated session

### Unauthenticated Users
- Can only see hero section
- Cannot see listings, map, filters, or messages
- Show CTA: "Log in with your student email to continue"

### Enforcement
- Middleware must protect:
  - /listings
  - /messages
  - /create
  - /map
- Redirect unauthenticated users → /login
- After login → redirect back to intended route
---

## Database Tables

- profiles
- listings (includes latitude, longitude)
- sublet_details
- saved_listings
- messages
- reviews
- roommate_profiles
- roommate_groups
- roommate_group_members

## RLS

- listings: public read, owner write
- saved_listings: owner only
- messages: sender/receiver only
- profiles: public read, owner write

---

## Design System

### Colors
- Primary: #006747 (olive green)
- Primary dark: #004d33
- Accent: #41B6E6 (sky blue)
- Background: #f2f2f7
- Cards: white, rounded-2xl, subtle border

### Typography
- Headings: Playfair Display
- Body: DM Sans

### Utility Classes
- `.card` `.btn-primary` `.btn-secondary` `.input` `.label-style` `.section-title`

---

## Required UI States (Every Page)

- Skeleton loading (never spinners)
- Empty state with CTA
- Error state with retry
- No layout shift
- Mobile-first (375px minimum)

---

## Homepage

### Core Rules
- No dead UI elements
- No placeholder components
- Every interaction must result in navigation or state change

### Hero Section
- Headline: "Student Housing, Done Right."
- Subhead: "Verified apartments, sublets, and roommates — built for students."
- Trust badge: "Built for students · @tulane.edu login required"
- Logged-out hero includes a "Log in with your student email" CTA button

### Auth Behavior
- `isAuthenticated: boolean | null` — null = checking, false = logged out, true = logged in
- If null: skeleton/loading state
- If NOT logged in: show hero + access-gated card + platform feature previews (no listings)
- If logged in: show hero + filter bar + full listings grid

### Listings Grid
- Fully integrated into homepage
- Clicking a listing MUST route to `/listings/[id]`
- NEVER allow non-clickable cards

### Listing States
- Loading: skeleton cards
- Empty: show CTA ("No listings found — adjust filters")
- Error: retry button

### Filter System (URL-param based)
- Filter state lives in URL search params — `useSearchParams()` is the source of truth
- `page.tsx` reads params and passes them into the Supabase query (server-filtered, not client-filtered)
- `HomeClient.tsx` → `FilterBar` component handles toggling params via `router.push`
- No re-render-on-keystroke; filter change = full re-fetch from Supabase

#### Active filters (all optional, URL params)
| Param | Type | Applied as |
|---|---|---|
| `furnished` | `'true'` | `.eq('furnished', true)` |
| `pets` | `'true'` | `.eq('pets', true)` |
| `sublet` | `'true'` | `.eq('is_sublease', true)` |
| `beds` | `'1'|'2'|'3'` | `.gte('beds', N)` |
| `price_max` | `'1000'|'1500'|'2000'` | `.lte('rent', N)` |
| `sort` | `'price_asc'|'price_desc'` | `.order('rent', ...)` |

#### Query Rules
- NEVER fetch full listings table — always `.range()` with PAGE_SIZE=40
- Filters applied inside Supabase query, not post-fetch
- "Clear all" pill removes all filter params at once

---

## Map Feature

- Must display real listings from Supabase
- NO static or mock data

### Fetching
- Use bounding box only:
  - minLat, maxLat, minLng, maxLng
- NEVER fetch all listings

### Markers
- Custom OverlayView ONLY
- Style:
  - Background: #006747
  - Text: white
  - Format: $950, $1.2k

### Behavior
- One popup open at a time
- Popup includes:
  - title
  - price
  - beds/baths
  - View Listing CTA → /listings/[id]

### Performance
- Debounce map movement: 400ms
- Lazy load map component
- Disable SSR

### Constraints
- Map must reflect real-time listings
- Broken or empty map is not acceptable

---

## Performance Rules

- Indexed queries always
- Always limit results
- No full table scans
- Page load <1.5s
- Map update <500ms
- Supabase fetches timeout after 8 seconds, then show error state

---

## Error Handling

- Every page has React error boundary
- Every Supabase fetch: try/catch/finally with loading, error, empty states
- Missing env vars show graceful fallback, never crash
- Auth failures redirect to /login
- Global error boundary in layout.tsx

---

## Deployment

- Web: Vercel, auto-deploy via GitHub — pushing to `main` triggers a Vercel production deployment automatically. No manual deploy step needed.
- Mobile: Expo, bundle ID com.waverow.app — requires rebuild or OTA for updates
- Env vars required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

### Deploy Workflow
1. Fix/build locally — run `npm run build` to confirm no TypeScript errors before pushing
2. Commit and push to `main` — Vercel picks it up automatically
3. Monitor at the Vercel dashboard

---

## How to Work on This Codebase

1. Analyze existing code first
2. Identify reusable logic
3. Propose minimal change
4. Implement safely
5. Always explain: what is reused, what is added, why

### AI Tool Policy
- Any AI tool (Claude Code, Cursor, Copilot, ChatGPT, etc.) that makes changes to this codebase **must update this CLAUDE.md file** to reflect those changes — new routes, schema changes, new components, updated conventions, removed features, etc.
- Keep this file as the single source of truth for any AI working on this project.
- If a section is outdated, correct it in the same session the change is made.

## Build Priority

1. Fix homepage (stats removal, trust badge, working search, working + button, footer)
2. Messages feature
3. Listings (core)
4. Map integration
5. Auth + dashboard
6. Create listing flow
7. Mobile sync
### Schema Relationships & Logic
## Messages Feature (E2EE REQUIRED)

- Route: /messages
- Protected route

### Core Requirement
- All messages MUST use End-to-End Encryption (E2EE)

### Encryption Rules
- Encrypt message BEFORE inserting into database
- Decrypt message AFTER fetching on client
- Database must NEVER store plaintext messages

### Implementation
- Use Web Crypto API:
  - crypto.subtle.generateKey
  - crypto.subtle.encrypt
  - crypto.subtle.decrypt

### Database Fields
- encrypted_content (string)
- iv (initialization vector)
- conversation_id

### UI
- Conversation list + message thread
- Mobile: full screen thread

### RLS
- sender and receiver only

### Performance
- Optimistic UI required
- **Mapping:** Use `st_asgeojson` or simple lat/long columns. Map bounds must be passed as `minLat, maxLat, minLng, maxLng` to the Supabase RPC function to ensure "Bounding Box" fetching only.
- **Profiles:** Every `auth.users` entry must have a corresponding `profiles` row (trigger-based).
### State Management Policy
- **URL as Truth:** Use search params (`?q=`, `?lat=`, `?id=`) for UI state (search, filters, selected listing) to allow for deep-linking.
- **Server Actions:** Use Next.js Server Actions for all mutations (creating listings, sending messages).
- **Optimistic UI:** Use `useOptimistic` for "Like/Save" actions and Message sending to ensure the 500ms responsiveness rule.
### Testing Standards
- **No Console Logs:** Remove all `console.log` before completing a task.
- **Accessibility:** All buttons/links must have `aria-label`. Use `lucide-react` icons with `size={20}`.
- **Responsive Breakpoints:** - Mobile: 375px (Primary focus)
  - Tablet: 768px
  - Desktop: 1024px
  ## Known Bug Patterns

### Hydration Mismatches
- NEVER access `window`, `document`, `localStorage`, or auth session state during SSR
- Any value that differs server vs client MUST use `useEffect` + `useState(null)` pattern:
```ts
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null // or skeleton
```
- Never use `Date.now()`, `Math.random()`, or `crypto.randomUUID()` in render — only in effects or handlers

### Supabase Joins
- NEVER use `select=*,table(col)` syntax unless a foreign key explicitly exists in the schema
- Always verify FK exists before writing relational selects
- If join is needed but FK is missing, write a migration first

### Google Maps
- ALWAYS null-check ref before initializing: `if (!mapRef.current) return`
- Map init MUST live inside `useEffect`
- Lazy load the map component with `dynamic(() => import(...), { ssr: false })`

---

## Security / CodeQL
- If CodeQL flags `js/xss-through-dom` for image previews, ensure any value rendered into `<img src>` is protocol-validated.
- Policy: allow `https:` for remote images and `blob:` for local `URL.createObjectURL(...)` previews; reject everything else (`javascript:`, `data:`, invalid URLs).
## Listings Detail Page

### Route
- /listings/[id]

### Requirements
- Server-side fetch using listing ID
- Display:
  - price
  - beds / baths
  - description
  - images
  - landlord info

### Actions
- Message landlord
- Save listing

### States
- Loading: skeleton
- Error: retry UI
- Missing listing: fallback message

- NEVER render blank page
## Stability Rules

- No blank pages under any condition
- No infinite loading states

### Required States (ALL pages)
- Loading (skeleton)
- Error (retry button)
- Empty (CTA)

### Supabase Failures
- Must show fallback UI
- Must NOT crash app
## UX Enforcement Rules

- Every button MUST:
  - Navigate OR mutate state

- Forbidden:
  - Dead buttons
  - Placeholder UI
  - Fake data
  - Non-clickable cards

- If interaction does nothing → it must be removed
- Login is REQUIRED before accessing listings, map, and messaging