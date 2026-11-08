'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check } from 'lucide-react'
import type { ClientPrimitive } from '@/contexts/commercial/domain/entities/Client'
import type { HealthPlanPrimitive } from '@/contexts/commercial/domain/entities/HealthPlan'
import type { ClientStatusValue } from '@/contexts/commercial/domain/value-objects/ClientStatus'
import { CLIENT_STATUS_LABELS, toInputDate } from '@/lib/format'

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-teal focus:ring-[3px] focus:ring-teal-50'

/** RF04 — edit a client's contract. */
export default function EditClientForm({ client }: { client: ClientPrimitive }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [plans, setPlans] = useState<HealthPlanPrimitive[] | null>(null)
  const [planId, setPlanId] = useState(client.planId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || plans) return
    fetch('/api/planos')
      .then((r) => r.json())
      .then((payload) => setPlans(payload.plans ?? []))
      .catch(() => setError('Não foi possível carregar os planos.'))
  }, [open, plans])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const form = new FormData(event.currentTarget)
    const text = (k: string) => String(form.get(k) ?? '').trim()
    const renewsOn = text('renewsOn')

    const response = await fetch(`/api/clientes/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        // The use case requires the fee alongside a plan change, so it always goes.
        monthlyFee: Number(form.get('monthlyFee')),
        lives: Number(form.get('lives')),
        renewsOn: renewsOn || null,
        status: text('status') as ClientStatusValue,
        city: text('city') || null,
        contactPerson: text('contactPerson') || null,
        opportunity: text('opportunity') || null,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    setSaving(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível salvar as alterações.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-sm border border-line-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
      >
        <Pencil size={15} aria-hidden /> Editar contrato
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar contrato"
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-[2px]"
      />

      <div className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-lg bg-surface p-7 shadow-[0_24px_60px_-16px_rgba(33,30,26,0.28)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold">Editar contrato</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="rounded-sm p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X size={19} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Plano contratado</span>
            {plans === null ? (
              <span className="text-[13px] text-muted">Carregando planos…</span>
            ) : (
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className={FIELD}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.carrier}
                  </option>
                ))}
              </select>
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
                defaultValue={client.monthlyFee / 100}
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
                defaultValue={client.lives}
                className={FIELD}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink-2">Renovação</span>
              <input
                name="renewsOn"
                type="date"
                defaultValue={toInputDate(client.renewsOn)}
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink-2">Situação</span>
              <select name="status" defaultValue={client.status} className={FIELD}>
                {Object.entries(CLIENT_STATUS_LABELS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Cidade</span>
            <input name="city" defaultValue={client.city ?? ''} className={FIELD} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Responsável</span>
            <input
              name="contactPerson"
              defaultValue={client.contactPerson ?? ''}
              placeholder="Quem responde pela empresa"
              className={FIELD}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">
              Oportunidade <span className="font-normal text-muted">(renovação, upgrade)</span>
            </span>
            <textarea
              name="opportunity"
              rows={2}
              defaultValue={client.opportunity ?? ''}
              className={`${FIELD} resize-y`}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-sm bg-critical-50 px-3 py-2.5 text-[13px] text-critical">
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-sm border border-line-2 px-4 py-2.5 text-[14px] font-semibold text-ink-2 transition hover:bg-surface-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-teal px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
            >
              <Check size={16} aria-hidden />
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
