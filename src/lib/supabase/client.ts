'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseEnv } from './env'

let client: SupabaseClient | null = null

/** Supabase client for Client Components. Shares the session cookie with the server. */
export function createClient(): SupabaseClient {
  if (client) {
    return client
  }
  const { url, anonKey } = supabaseEnv()
  client = createBrowserClient(url, anonKey)
  return client
}
