# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@.claude/CLAUDE.md

---

## Commands

```bash
# Development
npm run dev          # Start dev server (Next.js 16 / Turbopack)

# Production build (required before mobile sync)
npm run build        # Static export → out/

# Mobile (iOS)
npx cap sync ios     # Copy out/ → ios/App/App/public + update plugins
npx cap open ios     # Open Xcode workspace
```

**Before pushing:** always run `npm run build` locally — Vercel will fail on TypeScript errors.  
**Deploy:** `git push origin main` → Vercel auto-deploys. No manual step.  
**Mobile deploy:** `npm run build && npx cap sync ios`, then build/run from Xcode.

There is no test suite or linter configured.

---

## Architecture

### Request Lifecycle

1. `proxy.ts` (Next.js middleware) — refreshes the Supabase session cookie on every request and server-side redirects unauthenticated users away from protected routes (`/dashboard`, `/messages`, `/listings/new`, `/swipe`, `/settings`, `/roommates`, `/sublets`).
2. `app/layout.tsx` — wraps every page in `<AppShell>` (Navbar + BottomNav + GlobalFooter), `<ToastProvider>`, `<SplashOverlay>`, and `<AnalyticsProvider>`.
3. Pages are server components by default; only files with `'use client'` run in the browser.

### Supabase Client Strategy

| Context | Import |
|---|---|
| Server components / route handlers | `lib/supabase/server.ts → createClient()` |
| Client components / `lib/api.ts` | `lib/supabase/client.ts → createClient()` (singleton) |

**Never** call `createBrowserClient(...)` directly — always use the `createClient()` wrapper from the appropriate path to avoid session races.

### Data Layer (`lib/api.ts`)

All browser-side Supabase reads/writes go through `lib/api.ts`. Functions are typed against `types/index.ts` — the single source of truth for all DB types. Never infer types manually from query results; cast with `as Type[]` when a partial select is intentional.

### Page Pattern

Most routes follow a server/client split:
- `app/[route]/page.tsx` — server component, fetches initial data or session, passes to client component
- `app/[route]/[Route]Client.tsx` — `'use client'`, handles interactivity, optimistic UI, real-time

### Static Export + Capacitor

`next.config.ts` sets `output: 'export'` — all pages must be statically renderable. This means:
- No `middleware.ts` execution in the Capacitor/mobile build (auth is client-side only there)
- No dynamic API routes
- `webDir: 'out'` in `capacitor.config.ts` points Capacitor at the Next.js export

### Toast System

`components/ui/Toast.tsx` exports a module-level `toast` singleton (not React context). Call `toast.show('message', 'success'|'error'|'info')` from anywhere — client components and event handlers. `ToastProvider` is mounted once in `layout.tsx`.

### AI Tool Policy

Any AI tool (Claude Code, Cursor, Copilot, etc.) that modifies this codebase **must update this file or `.claude/CLAUDE.md`** in the same session to reflect new routes, schema changes, new components, or updated conventions.
