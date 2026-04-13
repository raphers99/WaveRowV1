import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/**
 * Browser Supabase client using @supabase/ssr's createBrowserClient.
 *
 * Stores auth tokens in cookies (not localStorage) so that the proxy.ts
 * middleware can read the session server-side and enforce protected routes.
 *
 * Singleton to avoid multiple GoTrueClient instances.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR / build time — return a throwaway client (won't be used for auth)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return browserClient
}
