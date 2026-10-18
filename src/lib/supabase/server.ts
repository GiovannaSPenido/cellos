import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createPlainClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseEnv, supabaseServiceRoleKey } from './env'

/**
 * Request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers. Carries the signed-in user, so row level security applies.
 *
 * Create a new one per request — never cache it across requests, or one user's
 * session would be served to another.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  const { url, anonKey } = supabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // A Server Component cannot write cookies. Refreshed tokens are
          // persisted by the proxy instead, which runs before rendering.
        }
      },
    },
  })
}

/**
 * Client that bypasses row level security. Used only where there is no
 * signed-in user but a write is still legitimate — a lead arriving from the
 * public contact form (RF06).
 *
 * Server-only: the service role key must never reach the browser.
 */
export function createServiceRoleClient(): SupabaseClient {
  const { url } = supabaseEnv()

  return createPlainClient(url, supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
