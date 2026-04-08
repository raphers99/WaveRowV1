import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/**
 * Single browser Supabase client using @supabase/supabase-js (localStorage auth).
 *
 * Since this app uses `output: 'export'` (static hosting / Capacitor),
 * there is no Next.js server, middleware, or cookie handling.
 * @supabase/ssr's createBrowserClient stores auth in cookies, which
 * don't persist properly without middleware to refresh them.
 *
 * Using the standard supabase-js client stores auth tokens in localStorage,
 * which works reliably for fully client-side apps.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR / build time — return a throwaway client (won't be used for auth)
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  if (!browserClient) {
    browserClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return browserClient
}
