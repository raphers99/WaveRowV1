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

- Next.js 15 (App Router, Server Components by default)
- TypeScript (strict mode, zero `any`)
- Tailwind CSS v4 (no inline styles)
- Supabase (DB, Auth, Realtime, Storage)
- React Native / Expo (mobile, bundle: com.waverow.app)
- framer-motion (minimal), lucide-react, date-fns, clsx

---

## Architecture

- Server components fetch via `lib/supabase/server.ts`
- Client components mutate via `lib/supabase/client.ts`
- All DB types from `types/index.ts` only — never infer manually
- Client components only when interactivity is required

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
- Protected routes (redirect if no session): `/create`, `/dashboard`, `/messages`

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

## Homepage Rules

### Stats Section — REMOVED
- Do not show any stats row (47+, 200+, 4.8 rating, etc.)
- These were placeholder/fake values — remove entirely
- Replace with trust badge: "100% Verified Tulane Users · @tulane.edu login required"

### Featured Listings
- Enlarge listing cards — make them the visual centerpiece
- Always render minimum 3 cards — use hardcoded mock data as fallback only
- Never render an empty listings section

### Search Bar
- Must be functional — connects to /listings/ with query param
- If full search not yet implemented, route to /listings/?q= and filter client-side
- Never render a non-functional search bar

### Hero Section
- Headline: "Student Housing, Done Right."
- Subhead: "Bridging the gap between students and landlords."
- Trust badge: "100% Verified Tulane Users · @tulane.edu login required"

### How It Works Section
- Keep the 01/02/03 steps layout
- Fix copy: Step 1 must say OTP/email — not "Google sign-in supported" (Google auth is not implemented)
- Step 2: Browse verified Uptown properties
- Step 3: Message the landlord directly through WaveRow

### Create Listing (+ Button)
- Must be fully wired — clicking navigates authenticated users to /create
- If user is not logged in, redirect to /login first then back to /create
- Never render a non-functional + button

### Footer / Disclosures
- Add a proper footer with:
  - WaveRow logo + slogan
  - Links: About, Listings, Contact, Privacy Policy, Terms of Service
  - Disclosure text: "WaveRow is a student housing marketplace. WaveRow does not own, manage, or guarantee any listed properties. Users are responsible for verifying listing accuracy. WaveRow is not a licensed real estate broker."
  - Copyright: "© 2025 WaveRow. All rights reserved."

---

## Messages Feature

- Full messaging tab in main nav
- Route: /messages
- Allows student-to-landlord and student-to-student communication
- Powered by Supabase Realtime on `messages` table
- UI: conversation list on left, message thread on right (mobile: full screen each)
- Protected route — must be logged in
- RLS: sender/receiver only

---

## Map Feature

- Map tab in main nav
- Google Maps JavaScript API + Geocoding API (key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- Custom pill-shaped price markers — white bg, dark green text, inverted on hover/select
- Custom OverlayView popup card (not native InfoWindow) — title, price, beds/baths, View Listing CTA
- One popup open at a time
- Clusters for close markers
- POI labels hidden, transit hidden, reduced saturation
- Opens centered on Uptown at zoom 14
- Bounding box fetch only — NEVER fetch all listings
- Debounce map movement 300-500ms
- Lazy load map component

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

- Web: Vercel, auto-deploy via GitHub
- Mobile: Expo, bundle ID com.waverow.app — requires rebuild or OTA for updates
- Env vars required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

---

## How to Work on This Codebase

1. Analyze existing code first
2. Identify reusable logic
3. Propose minimal change
4. Implement safely
5. Always explain: what is reused, what is added, why

## Build Priority

1. Fix homepage (stats removal, trust badge, working search, working + button, footer)
2. Messages feature
3. Listings (core)
4. Map integration
5. Auth + dashboard
6. Create listing flow
7. Mobile sync
### Schema Relationships & Logic
- **Messaging:** `messages` table must have `conversation_id` (UUID) to group threads. Logic: `SELECT * FROM messages WHERE sender_id = auth.uid() OR receiver_id = auth.uid()`.
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