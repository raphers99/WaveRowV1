# WaveRow — Product Roadmap & Status

Last updated: April 2026

---

## ✅ Completed

### Core Infrastructure
- [x] Next.js App Router with static export (`output: 'export'`) for Capacitor iOS compatibility
- [x] Supabase integration (auth, database, realtime, storage)
- [x] Full schema with RLS policies — `schema.sql`
- [x] Supabase Storage bucket (`listing-images`) with public read + owner write policies
- [x] Auto-create profile on signup via PostgreSQL trigger
- [x] Amplitude analytics + Sentry error tracking wrapper

### Auth
- [x] OTP magic link login (email)
- [x] Session persistence via localStorage (compatible with static export)
- [x] Profile auto-creation on first login
- [x] Fixed: Login was overwriting existing profile names — now checks before insert

### Listings
- [x] Create listing with photo upload, address, price, beds/baths, amenities
- [x] Geocoding on listing creation (address → lat/lng via Google Geocoding API)
- [x] Browse listings with filter support
- [x] Listing detail page (query-based routing `/listing?id=...`)
- [x] Edit listing (owner-only, pre-populated form)
- [x] Delete listing (owner-only with confirmation)
- [x] Save/unsave listings (favorites)
- [x] Fixed: Static routing migration from `/listings/[id]` dynamic routes to `/listing?id=...`

### Map
- [x] Interactive Google Maps with price-pill markers (OverlayView)
- [x] Viewport-bounded queries (fetches only listings within current map bounds)
- [x] Marker deduplication on pan (old markers cleared before re-rendering)
- [x] Listing popup card with "View Listing" CTA
- [x] Static map image on listing detail page (Maps Static API)
- [x] Admin geocoding resync tool at `/admin/fix-map`
- [x] Google Maps API configured: Maps JavaScript API, Maps Static API, Geocoding API

### Messaging
- [x] Conversation inbox
- [x] Real-time message threads via Supabase Realtime
- [x] Optimistic UI with retry on failure
- [x] E2EE encryption: AES-GCM via WebCrypto API (PBKDF2-derived key per conversation)
- [x] Graceful fallback for legacy plaintext messages

### Profiles & Settings
- [x] Profile view with name, bio, role, avatar
- [x] Profile settings page (edit name, bio)
- [x] Fixed: Profile updates via `SECURITY DEFINER` RPC functions (required for static export)
- [x] Landlord vs Student role display

### UI/UX
- [x] Bottom navigation bar
- [x] Navbar with auth state
- [x] Toast notification system
- [x] Loading skeletons
- [x] Empty states with CTAs
- [x] Error boundaries
- [x] Mobile-responsive layouts
- [x] Safe area insets for iOS notch/home indicator

### DevOps
- [x] Deployed on Vercel (auto-deploy from `main` branch)
- [x] GitHub repository: `raphers99/WaveRowV1`
- [x] Environment variables configured in Vercel dashboard

---

## 🚧 In Progress / Known Issues

- [ ] **API key restrictions:** Confirm the Google Maps API key has no HTTP referrer restrictions that would block Capacitor iOS requests (should allow `capacitor://localhost/*`)
- [ ] **Listing `"1231"` address:** One test listing has an incomplete address (just a street number). Needs to be corrected in Supabase directly.

---

## 🔮 Planned Features

### P1 — High Priority
- [ ] **Push notifications** (Capacitor + APNs) for new messages
- [ ] **Image management on edit** — Delete old photos from storage when listing is updated
- [ ] **Verified landlord badge** — Display verification status prominently on listings
- [ ] **Listing search** — Full-text search by address, neighborhood, or description

### P2 — Medium Priority
- [ ] **Roommate matching algorithm** — Score and rank roommate profiles
- [ ] **Swipe deck pagination** — Cursor-based pagination instead of full load
- [ ] **Review system** — Allow students to rate landlords after a lease
- [ ] **Sublets** — Enhanced sublet listing flow with lease dates
- [ ] **Neighborhood guides** — Static content pages per neighborhood

### P3 — Long Term
- [ ] **Automated testing** — E2E tests for auth, listing CRUD, and messaging flows
- [ ] **Server-side rendering** — Migrate away from static export if iOS moves to a native bridge
- [ ] **Native iOS features** — Camera access for photo upload, location services for nearby listings
- [ ] **Admin dashboard** — Moderation tools for flagged listings and users

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| `output: 'export'` (static) | Required for Capacitor iOS — no Node.js server in the wrapper |
| localStorage auth | `@supabase/ssr` cookie auth incompatible with static export |
| Query-based routing (`?id=`) | Dynamic routes (`/listing/[id]`) cause 404s on Vercel static export |
| WebCrypto AES-GCM E2EE | Native browser API, no external dependency, works in Capacitor |
| RPC `SECURITY DEFINER` functions | Required for mutations that bypass RLS in static export context |
| Viewport-bounded map queries | Prevents full table scans as listing count scales |