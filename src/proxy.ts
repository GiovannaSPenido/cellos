import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseEnv } from '@/lib/supabase/env'

/** Paths that require a signed-in user (RNF01). */
const PROTECTED_PREFIXES = ['/dashboard', '/prospeccao', '/clientes', '/agenda']

const LOGIN_PATH = '/login'

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  )
}

/**
 * Runs before rendering: refreshes the Supabase session so Server Components
 * see a valid user, and keeps the management module behind authentication.
 *
 * Renamed from `middleware.ts`, which Next.js 16 deprecated.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const { url, anonKey } = supabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        // Responses that set auth cookies must not be cached, or one user's
        // token could be served to another.
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      },
    },
  })

  // Always call getUser: it validates the token with Supabase and triggers the
  // refresh that setAll writes back. Reading the session alone would not.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && isProtected(pathname)) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = LOGIN_PATH
    redirect.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirect)
  }

  if (user && pathname === LOGIN_PATH) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/dashboard'
    redirect.search = ''
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files, so the session is
     * refreshed on real navigations without running on every icon request.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
  ],
}
