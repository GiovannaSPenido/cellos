'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import type { SimulationResult } from '@/contexts/commercial/application/usecases/SimulatePriceUseCase'
import type { AgeBracketCode } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import type { PersonTypeValue } from '@/contexts/commercial/domain/value-objects/PersonType'
import { Badge } from '@/components/ui'
import { formatBRL } from '@/lib/format'

export default function PriceSimulator({
  ageBrackets,
}: {
  ageBrackets: { code: AgeBracketCode; label: string }[]
}) {
  const [personType, setPersonType] = useState<PersonTypeValue>('PF')
  const [ageBracket, setAgeBracket] = useState<AgeBracketCode>('19-28')
  const [lives, setLives] = useState(5)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Re-prices whenever an input changes; the calculation is a single request.
  useEffect(() => {
    let active = true
    setError(null)

    fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personType, ageBracket, lives }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!active) return
        if (!response.ok) {
          setError(payload.error ?? 'Não foi possível simular agora.')
          return
        }
        setResult(payload)
      })
      .catch(() => active && setError('Não foi possível simular agora.'))

    return () => {
      active = false
    }
  }, [personType, ageBracket, lives])

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
      {/* controles */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-6 lg:sticky lg:top-[88px]"
      >
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-ink-2">
            Tipo de contratação
          </legend>
          <div className="flex gap-2.5">
            {(['PF', 'PJ'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPersonType(type)}
                aria-pressed={personType === type}
                className={`flex-1 rounded-md border px-3 py-3 text-[14px] font-semibold transition ${
                  personType === type
                    ? 'border-brand-700 bg-brand-50 text-brand-700'
                    : 'border-line-2 text-ink-2 hover:bg-surface-2'
                }`}
              >
                {type === 'PF' ? 'Pessoa física' : 'Empresa'}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-ink-2">
            Faixa etária {personType === 'PJ' && '(titular principal)'}
          </span>
          <select
            value={ageBracket}
            onChange={(e) => setAgeBracket(e.target.value as AgeBracketCode)}
            className="w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:border-teal focus:ring-[3px] focus:ring-teal-50"
          >
            {ageBrackets.map((bracket) => (
              <option key={bracket.code} value={bracket.code}>
                {bracket.label}
              </option>
            ))}
          </select>
        </label>

        {personType === 'PJ' && (
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-ink-2">
              Número de vidas: <b className="tabular font-mono">{lives}</b>
            </span>
            <input
              type="range"
              min={2}
              max={60}
              value={lives}
              onChange={(e) => setLives(Number(e.target.value))}
              className="w-full accent-[var(--color-brand-700)]"
            />
            <span className="flex justify-between text-[11px] text-muted">
              <span>2</span>
              <span>60</span>
            </span>
          </label>
        )}

        <p className="flex gap-2.5 rounded-md bg-teal-50 p-4 text-[12.5px] leading-relaxed text-teal-600">
          <Info size={18} aria-hidden className="mt-px shrink-0" />
          Empresas têm condições especiais por volume de vidas. Fale com a Cellos para uma
          proposta sob medida.
        </p>
      </form>

      {/* resultados */}
      <div className="flex flex-col gap-3.5">
        {error && (
          <p role="alert" className="rounded-md bg-critical-50 px-5 py-4 text-[14px] text-critical">
            {error}
          </p>
        )}

        {!result && !error && (
          <p className="rounded-lg border border-line bg-surface px-6 py-10 text-center text-[14px] text-muted">
            Calculando…
          </p>
        )}

        {result?.plans.map((plan) => (
          <article
            key={plan.planId}
            className={`flex flex-wrap items-center gap-5 rounded-lg bg-surface p-6 shadow-[0_1px_2px_rgba(33,30,26,0.05)] ${
              plan.featured ? 'border-2 border-brand' : 'border border-line'
            }`}
          >
            <div className="min-w-[180px] flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[19px] font-extrabold">{plan.name}</h2>
                {plan.featured && <Badge tone="brand">Mais escolhido</Badge>}
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {plan.coverageType} · {plan.coverageArea} · {plan.accommodation}
              </p>
            </div>

            <div className="text-right">
              {result.personType === 'PJ' && (
                <p className="text-[12px] text-muted">
                  {formatBRL(plan.perLife)}/vida · {result.lives} vidas
                </p>
              )}
              <p className="flex items-baseline justify-end gap-1">
                <span className="tabular text-[28px] font-extrabold tracking-tight">
                  {formatBRL(plan.total)}
                </span>
                <span className="text-[13px] font-semibold text-muted">/mês</span>
              </p>
            </div>

            <Link
              href={`/contato?plano=${encodeURIComponent(plan.name)}`}
              className={`rounded-sm px-4 py-2.5 text-[13.5px] font-semibold transition ${
                plan.featured
                  ? 'bg-teal text-white hover:bg-teal-600'
                  : 'border border-line-2 text-ink-2 hover:bg-surface-2'
              }`}
            >
              Contratar
            </Link>
          </article>
        ))}

        {result && (
          <p className="mt-1 text-[12.5px] text-muted">
            * Estimativa para a faixa {result.ageBracketLabel.toLowerCase()}. O preço final
            pode variar conforme cidade e condições da operadora. Não constitui proposta
            contratual.
          </p>
        )}
      </div>
    </div>
  )
}
