'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Handshake } from 'lucide-react'
import type { LeadPrimitive } from '@/contexts/commercial/domain/entities/Lead'
import type { HealthPlanPrimitive } from '@/contexts/commercial/domain/entities/HealthPlan'
import { formatBRL } from '@/lib/format'

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-teal focus:ring-[3px] focus:ring-teal-50'

/** `YYYY-MM-DD` for a date input, from the local calendar. */
function toInputDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * RNG05 — turns a lead into a client. The lead row survives, so every
 * interaction recorded while prospecting stays attached to the new client.
 */
export default function ConvertLeadForm({
  lead,
  onBack,
  onConverted,
}: {
  lead: LeadPrimitive
  onBack: () => void
  onConverted: () => void
}) {
  const [plans, setPlans] = useState<HealthPlanPrimitive[] | null>(null)
  const [planId, setPlanId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = useMemo(() => new Date(), [])
  const inOneYear = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/planos')
      .then((r) => r.json())
      .then((payload) => {
        if (!active) return
        const list: HealthPlanPrimitive[] = payload.plans ?? []
        setPlans(list)
        // Pre-select the plan the lead was interested in, when it still matches.
        const match = list.find((p) => p.name === lead.planOfInterest)
        setPlanId(match?.id ?? list[0]?.id ?? '')
      })
      .catch(() => active && setError('Não foi possível carregar os planos.'))
    return () => {
      active = false
    }
  }, [lead.planOfInterest])

  const selected = plans?.find((p) => p.id === planId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const form = new FormData(event.currentTarget)
    const renewsOn = String(form.get('renewsOn') ?? '').trim()

    const response = await fetch(`/api/leads/${lead.id}/converter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        monthlyFee: Number(form.get('monthlyFee')),
        startsOn: String(form.get('startsOn')),
        renewsOn: renewsOn || null,
        lives: Number(form.get('lives')),
        city: String(form.get('city') ?? '').trim() || null,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    setSaving(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível converter o lead.')
      return
    }

    onConverted()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-line-2 px-3 py-1.5 text-[13px] font-semibold text-ink-2 transition hover:bg-surface-2"
      >
        <ArrowLeft size={14} aria-hidden /> Voltar ao lead
      </button>

      <div>
        <h3 className="text-[17px] font-extrabold">Converter em cliente</h3>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          O lead continua no sistema e todo o histórico de interações passa para o cliente.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Plano contratado</span>
        {plans === null ? (
          <span className="text-[13px] text-muted">Carregando planos…</span>
        ) : (
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            required
            className={FIELD}
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — {plan.carrier}
              </option>
            ))}
          </select>
        )}
        {selected && (
          <span className="text-[12px] text-muted">
            Tabela: {formatBRL(selected.basePrice)}/mês por vida, antes da faixa etária.
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Mensalidade total</span>
          <input
            name="monthlyFee"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={lead.estimatedValue ? lead.estimatedValue / 100 : undefined}
            placeholder="R$"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Vidas</span>
          <input
            name="lives"
            type="number"
            min={1}
            required
            defaultValue={lead.lives}
            className={FIELD}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Início de vigência</span>
          <input
            name="startsOn"
            type="date"
            required
            defaultValue={toInputDate(today)}
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Renovação</span>
          <input
            name="renewsOn"
            type="date"
            defaultValue={toInputDate(inOneYear)}
            className={FIELD}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Cidade</span>
        <input name="city" placeholder="Belo Horizonte / MG" className={FIELD} />
      </label>

      {error && (
        <p role="alert" className="rounded-sm bg-critical-50 px-3 py-2.5 text-[13px] text-critical">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !planId}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-sm bg-teal px-4 py-3 text-[14.5px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
      >
        <Handshake size={17} aria-hidden />
        {saving ? 'Convertendo…' : 'Confirmar conversão'}
      </button>
    </form>
  )
}
