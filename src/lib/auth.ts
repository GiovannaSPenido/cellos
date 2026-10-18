import { redirect } from 'next/navigation'
import User from '@/contexts/commercial/domain/entities/User'
import SupabaseUserRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseUserRepository'
import { createServerSupabaseClient } from './supabase/server'

/**
 * The signed-in operator as a domain entity, or null when nobody is signed in.
 *
 * The Auth user carries only credentials; the profile that decides what they
 * may see (section 7.5) lives in `usuarios`, so both are read.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const users = new SupabaseUserRepository(supabase)
  return users.findById(authUser.id)
}

/**
 * Same, but sends anyone not signed in to the login screen. Use this at the top
 * of every page and route handler behind the management module.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }
  if (!user.active) {
    redirect('/login?error=inactive')
  }

  return user
}

/** Use where a page is reserved for administrators. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser()

  if (!user.isAdmin()) {
    redirect('/dashboard')
  }

  return user
}
