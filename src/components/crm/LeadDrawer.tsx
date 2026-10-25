'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Flame } from 'lucide-react'
import type { LeadPrimitive } from '@/contexts/commercial/domain/entities/Lead'
import type { InteractionPrimitive } from '@/contexts/commercial/domain/entities/Interaction'
import type { InteractionTypeValue } from '@/contexts/commercial/domain/value-objects/InteractionType'
import type { LeadStatusValue } from '@/contexts/commercial/domain/value-objects/LeadStatus'
import { Avatar, Badge } from '@/components/ui'
import {
  INTERACTION_LABELS,
  LEAD_STAGES,
  PERSON_TYPE_LABELS,
  formatBRL,
  formatDate,
  plural,
  stageOf,
} from '@/lib/format'

interface History {
  lead: LeadPrimitive
  interactions: InteractionPrimitive[]
}

export default function LeadDrawer({
  leadId,
  onClose,
  onChanged,
}: {
  leadId: string
  onClose: () => void
  onChanged: () => void
}) {
  const [data, setData] = useState<History | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [type, setType] = useState<InteractionTypeValue>('CALL')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    setData(null)
    setError(null)

    fetch(`/api/leads/${leadId}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!active) return
        if (!response.ok) {
          setError(payload.error ?? 'Não foi possível carregar o lead.')
          return
        }
        setData(payload)
      })
      .catch(() => active && setError('Não foi possível carregar o lead.'))

    return () => {
      active = false
    }
  }, [leadId])

  // Escape closes the drawer, as a dialog should.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function registerInteraction() {
    if (!description.trim() || busy) return
    setBusy(true)

    const response = await fetch(`/api/leads/${leadId}/interacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, description: description.trim() }),
    })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível registrar a interação.')
      return
    }

    setDescription('')
    setData((current) =>
      current ? { ...current, interactions: [payload.interaction, ...current.interactions] } : current,
    )
    onChanged()
  }

  async function changeStage(status: LeadStatusValue) {
    if (busy || !data || data.lead.status === status) return
    setBusy(true)
    setError(null)

    const response = await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível mover o lead.')
      return
    }

    setData((current) => (current ? { ...current, lead: payload.lead } : current))
    onChanged()
  }

  const lead = data?.lead
  const title = lead ? lead.company || lead.name : 'Carregando…'

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-[2px]"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-surface shadow-[0_24px_60px_-16px_rgba(33,30,26,0.28)]">
        {/* cabeçalho */}
        <header className="border-b border-line px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              {lead && <Avatar name={title} size={46} />}
              <div className="min-w-0">
                <h2 className="truncate text-[20px] font-extrabold">{title}</h2>
                {lead && (
                  <p className="truncate text-[13px] text-muted">
                    {lead.company ? `${lead.name}${lead.role ? ` · ${lead.role}` : ''}` : PERSON_TYPE_LABELS.PF}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-sm p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X size={19} aria-hidden />
            </button>
          </div>

          {lead && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Badge tone={stageOf(lead.status).tone} dot>
                {stageOf(lead.status).label}
              </Badge>
              <Badge tone={lead.personType === 'PJ' ? 'deep' : 'neutral'}>
                {lead.personType}
                {lead.personType === 'PJ' ? ` · ${plural(lead.lives, 'vida')}` : ''}
              </Badge>
              {lead.hot && (
                <Badge tone="brand">
                  <Flame size={12} aria-hidden /> Quente
                </Badge>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <p role="alert" className="mb-4 rounded-sm bg-critical-50 px-3.5 py-2.5 text-[13px] text-critical">
              {error}
            </p>
          )}

          {!lead && !error && <p className="text-[14px] text-muted">Carregando…</p>}

          {lead && (
            <div className="flex flex-col gap-6">
              {/* dados */}
              <dl className="flex flex-col">
                {[
                  ['Telefone', lead.phone],
                  ['E-mail', lead.email],
                  ['Origem', lead.origin ?? '—'],
                  ['Plano de interesse', lead.planOfInterest ?? '—'],
                  [
                    'Valor estimado',
                    lead.estimatedValue ? `${formatBRL(lead.estimatedValue)}/mês` : '—',
                  ],
                  ['Próximo contato', formatDate(lead.nextContactAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-line py-2.5 text-[13.5px]"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* mover etapa */}
              <section>
                <h3 className="mb-2.5 text-[13px] font-bold">Mover para etapa</h3>
                <div className="flex flex-wrap gap-1.5">
                  {LEAD_STAGES.map((stage) => {
                    const active = lead.status === stage.id
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        disabled={busy}
                        onClick={() => changeStage(stage.id)}
                        aria-pressed={active}
                        className="rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-semibold transition disabled:opacity-60"
                        style={
                          active
                            ? { background: stage.color, borderColor: stage.color, color: '#fff' }
                            : { borderColor: 'var(--color-line-2)', color: 'var(--color-ink-2)' }
                        }
                      >
                        {stage.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* registrar interação */}
              <section>
                <h3 className="mb-2.5 text-[13px] font-bold">Registrar interação</h3>
                <div className="flex gap-2">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InteractionTypeValue)}
                    aria-label="Tipo de contato"
                    className="w-[128px] shrink-0 rounded-sm border border-line-2 bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-brand-700"
                  >
                    {Object.entries(INTERACTION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && registerInteraction()}
                    placeholder="O que aconteceu?"
                    aria-label="Descrição da interação"
                    className="min-w-0 flex-1 rounded-sm border border-line-2 bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-brand-700"
                  />
                  <button
                    type="button"
                    onClick={registerInteraction}
                    disabled={busy || !description.trim()}
                    aria-label="Registrar"
                    className="shrink-0 rounded-sm bg-brand-700 px-3 text-white transition hover:bg-deep disabled:opacity-50"
                  >
                    <Plus size={16} aria-hidden />
                  </button>
                </div>
              </section>

              {/* histórico */}
              <section>
                <h3 className="mb-3 text-[13px] font-bold">
                  Histórico{' '}
                  <span className="font-mono font-normal text-muted">
                    ({data.interactions.length})
                  </span>
                </h3>

                {data.interactions.length === 0 ? (
                  <p className="text-[13px] text-muted">Nenhuma interação registrada ainda.</p>
                ) : (
                  <ul className="flex flex-col gap-3.5">
                    {data.interactions.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-surface-2 font-mono text-[10px] font-bold text-muted">
                          {INTERACTION_LABELS[item.type].slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-ink-2">{item.description}</p>
                          <p className="tabular mt-0.5 font-mono text-[10.5px] text-muted-2">
                            {INTERACTION_LABELS[item.type]} · {formatDate(item.occurredAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {lead.notes && (
                  <p className="mt-4 rounded-sm bg-caution-50 px-3.5 py-3 text-[13px] leading-snug text-[#7a5610]">
                    {lead.notes}
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
