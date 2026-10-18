/** Read once, at call time, so a build does not require the environment. */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
    )
  }

  return { url, anonKey }
}

/**
 * Only for server-side work that must bypass row level security — capturing a
 * lead from the public website, where there is no signed-in user to own the
 * insert. Never import this from a Client Component.
 */
export function supabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY: required to accept leads from the public site',
    )
  }

  return key
}
