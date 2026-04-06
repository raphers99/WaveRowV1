/**
 * Analytics + error tracking wrapper.
 * Amplitude  → product analytics
 * Sentry     → crash / error tracking
 * Supabase   → server-side event log
 *
 * All functions are fire-and-forget safe — they never throw.
 */

import type { BrowserOptions } from '@sentry/browser'

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventProperties = Record<string, string | number | boolean | null | undefined>

interface TraceHandle {
  finish: () => void
}

// ─── State ───────────────────────────────────────────────────────────────────

let _initialized = false
let _userId: string | null = null
const IS_DEV = process.env.NODE_ENV === 'development'

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initAnalytics(): Promise<void> {
  if (_initialized || typeof window === 'undefined') return
  _initialized = true

  try {
    // Amplitude
    const amplitude = await import('@amplitude/analytics-browser')
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? 'MISSING_KEY', {
      defaultTracking: { sessions: false, pageViews: false, formInteractions: false, fileDownloads: false },
      logLevel: IS_DEV ? 2 : 0, // 2 = Debug, 0 = None
    })
  } catch (e) {
    if (IS_DEV) console.warn('[Analytics] Amplitude init failed', e)
  }

  try {
    // Sentry
    const Sentry = await import('@sentry/browser')
    const opts: BrowserOptions = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
      environment: process.env.NODE_ENV,
      tracesSampleRate: IS_DEV ? 1.0 : 0.15,
      enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    }
    Sentry.init(opts)
  } catch (e) {
    if (IS_DEV) console.warn('[Analytics] Sentry init failed', e)
  }
}

// ─── Identity ────────────────────────────────────────────────────────────────

export async function identifyUser(userId: string, traits?: EventProperties): Promise<void> {
  _userId = userId

  try {
    const amplitude = await import('@amplitude/analytics-browser')
    amplitude.setUserId(userId)
    if (traits) {
      const id = new amplitude.Identify()
      Object.entries(traits).forEach(([k, v]) => {
        if (v != null) id.set(k, v as string | number | boolean)
      })
      amplitude.identify(id)
    }
  } catch {}

  try {
    const Sentry = await import('@sentry/browser')
    Sentry.setUser({ id: userId })
  } catch {}
}

export async function resetUser(): Promise<void> {
  _userId = null
  try {
    const amplitude = await import('@amplitude/analytics-browser')
    amplitude.reset()
  } catch {}
  try {
    const Sentry = await import('@sentry/browser')
    Sentry.setUser(null)
  } catch {}
}

// ─── Core event tracker ──────────────────────────────────────────────────────

export function trackEvent(name: string, properties?: EventProperties): void {
  const props: EventProperties = {
    user_id: _userId ?? undefined,
    timestamp: new Date().toISOString(),
    device_type: 'ios',
    ...properties,
  }

  if (IS_DEV) {
    console.log(`%c[Analytics] ${name}`, 'color: #006747; font-weight: bold', props)
  }

  // Amplitude (async import won't block)
  import('@amplitude/analytics-browser')
    .then(amp => amp.track(name, props))
    .catch(() => {})

  // Sentry breadcrumb
  import('@sentry/browser')
    .then(S => S.addBreadcrumb({ message: name, data: props, level: 'info', category: 'user_action' }))
    .catch(() => {})

  // Supabase event log (best-effort, no await)
  _logToSupabase(name, props)
}

// ─── Screen views ────────────────────────────────────────────────────────────

const ROUTE_TO_SCREEN: Record<string, string> = {
  '/': 'home',
  '/listings': 'browse',
  '/listings/new': 'new_listing',
  '/dashboard': 'profile',
  '/roommates': 'roommates',
  '/messages': 'messages',
  '/settings': 'settings',
  '/swipe': 'swipe',
  '/sublets': 'sublets',
  '/neighborhoods': 'neighborhoods',
  '/tools': 'tools',
  '/login': 'login',
  '/auth/callback': 'auth_callback',
}

export function screenNameFromPath(pathname: string): string {
  if (ROUTE_TO_SCREEN[pathname]) return ROUTE_TO_SCREEN[pathname]
  if (pathname.startsWith('/listings/')) return 'listing_detail'
  return pathname.replace(/^\//, '').replace(/\//g, '_') || 'unknown'
}

export function trackScreenView(pathname: string): void {
  const screen_name = screenNameFromPath(pathname)
  trackEvent('screen_view', { screen_name, path: pathname })
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export function trackError(error: unknown, context?: EventProperties): void {
  const err = error instanceof Error ? error : new Error(String(error))

  trackEvent('error', {
    error_name: err.name,
    error_message: err.message,
    ...context,
  })

  import('@sentry/browser')
    .then(S => S.captureException(err, { extra: context }))
    .catch(() => {})
}

export function trackApiError(endpoint: string, statusCode: number | undefined, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  trackEvent('api_error', { endpoint, status_code: statusCode, error_message: message })

  import('@sentry/browser')
    .then(S => S.captureMessage(`API error: ${endpoint}`, {
      level: 'error',
      extra: { endpoint, statusCode, message },
    }))
    .catch(() => {})
}

// ─── Performance traces ──────────────────────────────────────────────────────

export function startTrace(name: string): TraceHandle {
  if (typeof performance === 'undefined') return { finish: () => {} }
  const start = performance.now()
  return {
    finish() {
      const duration_ms = Math.round(performance.now() - start)
      trackEvent('performance_trace', { trace_name: name, duration_ms })
      if (duration_ms > 300) {
        trackEvent('slow_render', { screen_name: name, duration_ms })
        if (IS_DEV) console.warn(`[Performance] Slow render: ${name} took ${duration_ms}ms`)
      }
    },
  }
}

// ─── Supabase event log ──────────────────────────────────────────────────────

function _logToSupabase(eventName: string, metadata: EventProperties): void {
  // Fire-and-forget — skip session-noise events to keep the table lean
  const SKIP = new Set(['performance_trace', 'screen_view'])
  if (SKIP.has(eventName)) return

  import('@supabase/ssr')
    .then(({ createBrowserClient }) => {
      const sb = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      return sb.from('analytics_events').insert({
        user_id: _userId ?? null,
        event_name: eventName,
        metadata,
      })
    })
    .catch(() => {}) // never surface analytics errors to the user
}
