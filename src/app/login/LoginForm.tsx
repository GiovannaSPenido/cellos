'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/** Supabase returns English messages; these are the ones a user actually hits. */
const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'inactive' ? 'Seu acesso está desativado.' : null,
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(MESSAGES[signInError.message] ?? 'Não foi possível entrar. Tente novamente.')
      setSubmitting(false)
      return
    }

    // Re-render from the server so the proxy sees the fresh session cookie.
    router.replace(searchParams.get('redirectTo') ?? '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-semibold text-ink-2">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:border-brand-700 focus:ring-[3px] focus:ring-brand-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-semibold text-ink-2">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:border-brand-700 focus:ring-[3px] focus:ring-brand-50"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-sm bg-critical-50 px-3.5 py-2.5 text-[13.5px] text-critical"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-md bg-brand-700 px-5 py-3.5 text-[16px] font-semibold text-white transition hover:bg-deep disabled:opacity-60"
      >
        {submitting ? 'Entrando…' : 'Entrar no painel'}
      </button>
    </form>
  )
}
