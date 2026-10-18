'use client'

import { useEffect } from 'react'
import { TriangleAlert, RotateCw } from 'lucide-react'

/**
 * Keeps a failed query from blanking the whole module. The most common cause in
 * practice is the database being unreachable — a free-tier Supabase project
 * pauses after about a week idle — so that case gets its own wording.
 */
export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const unreachable = /fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(error.message)

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-[460px] text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-critical-50 text-critical">
          <TriangleAlert size={22} aria-hidden />
        </span>

        <h1 className="mt-5 text-[22px] font-extrabold">
          {unreachable ? 'Banco de dados indisponível' : 'Algo deu errado'}
        </h1>

        <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
          {unreachable ? (
            <>
              Não foi possível falar com o Supabase. Projetos no plano gratuito são
              suspensos após alguns dias sem uso — abra o painel do Supabase e clique em{' '}
              <span className="font-semibold text-ink-2">Restore project</span>. Nenhum dado
              é perdido.
            </>
          ) : (
            'Não foi possível carregar esta página. Tente novamente em instantes.'
          )}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-deep"
        >
          <RotateCw size={16} aria-hidden />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
