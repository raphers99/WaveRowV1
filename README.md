# WaveRow

**The student housing platform for New Orleans.** WaveRow connects Tulane, Loyola, and local university students with landlords and subletters in the surrounding neighborhoods.

🌐 **Live:** [waverow.app](https://waverow.app)  
📱 **iOS:** Capacitor wrapper (WKWebView)  
🗄️ **Backend:** Supabase (auth, database, storage, realtime)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Vanilla CSS (design tokens) |
| Backend | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Google OAuth (@tulane.edu only) |
| Storage | Supabase Storage (`listing-images` bucket) |
| Maps | Google Maps JavaScript API + Static Maps API |
| Geocoding | Google Geocoding API |
| Analytics | Amplitude |
| Mobile | Capacitor (iOS) |
| Hosting | Vercel |

---

## Features

- 🏠 **Listings** — Create, browse, filter, edit, and delete property listings
- 🗺️ **Map View** — Interactive map with price-pill markers, viewport-bounded queries
- 💬 **Messaging** — E2EE encrypted direct messages between students and landlords (AES-GCM via WebCrypto)
- 🤝 **Roommates** — Roommate discovery and matching
- 🔄 **Swipe** — Tinder-style listing discovery
- ❤️ **Saved Listings** — Bookmark listings for later
- 👤 **Profiles** — Student and landlord profiles with verification status
- 📊 **Dashboard** — Manage your own listings

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Cloud project with these APIs enabled:
  - Maps JavaScript API
  - Maps Static API
  - Geocoding API

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key   # optional
```

### Database Setup

Run `schema.sql` in your Supabase SQL Editor to create all tables, RLS policies, storage buckets, and triggers.

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Admin Tools

### Fix Map Coordinates

If listings have incorrect or missing GPS coordinates, navigate to:

```
/admin/fix-map
```

This page re-geocodes all listings owned by the logged-in user using the Google Geocoding API and updates `lat`/`lng` in the database.

---

## Project Structure

```
app/
├── page.tsx              # Homepage
├── listing/              # Listing detail + edit
├── listings/new/         # Create listing
├── map/                  # Interactive map
├── messages/             # Messaging inbox + threads
├── roommates/            # Roommate discovery
├── dashboard/            # User dashboard
├── settings/             # Profile settings
├── admin/fix-map/        # Admin geocoding tool
components/
├── listing/              # ListingCard, etc.
├── messages/             # MessageThread, MessageBubble
├── navigation/           # Navbar, BottomNav
lib/
├── supabase/             # Supabase client helpers
├── api.ts                # Shared API functions
├── analytics.ts          # Amplitude + Sentry wrapper
```

---

## Deployment

The app is deployed on **Vercel** with automatic deployments from the `main` branch.

Required Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## Architecture Notes

- **Static Export:** The app uses `output: 'export'` for Capacitor iOS compatibility. This means no server actions or middleware — all auth is client-side via localStorage.
- **RLS:** All Supabase tables enforce Row Level Security. Mutations use `SECURITY DEFINER` RPC functions where needed.
- **E2EE Messaging:** Messages are encrypted client-side with AES-GCM (PBKDF2-derived key from conversation ID) before being stored in Supabase.
- **Map:** Viewport-bounded queries only — the map fetches listings within the current `getBounds()` rectangle on every `idle` event.
