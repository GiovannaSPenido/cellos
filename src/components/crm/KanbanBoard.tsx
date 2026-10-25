'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Calendar } from 'lucide-react'
import type { LeadPrimitive } from '@/contexts/commercial/domain/entities/Lead'
import type { LeadStatusValue } from '@/contexts/commercial/domain/value-objects/LeadStatus'
import { LEAD_STAGES, formatBRL, formatShortDate, plural } from '@/lib/format'
import { Badge } from '@/components/ui'
import LeadDrawer from './LeadDrawer'

export default function KanbanBoard({ initialLeads }: { initialLeads: LeadPrimitive[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<LeadStatusValue | null>(null)
  const [openLead, setOpenLead] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function moveTo(leadId: string, status: LeadStatusValue) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === status) return

    if (status === 'CONVERTED') {
      setNotice(
        'Para fechar um contrato, abra o lead e use "Converter em cliente" — é preciso informar plano, mensalidade e vigência.',
      )
      return
    }

    const previous = leads
    // Move the card immediately; dragging that waits for the network feels broken.
    setLeads((current) => current.map((l) => (l.id === leadId ? { ...l, status } : l)))

    const response = await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setLeads(previous)
      setNotice(payload.error ?? 'Não foi possível mover o lead.')
      return
    }

    router.refresh()
  }

  return (
    <>
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-start justify-between gap-4 rounded-sm bg-caution-50 px-4 py-3 text-[13.5px] text-[#8a6410]"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 font-semibold underline"
          >
            fechar
          </button>
        </div>
      )}

      <div className="flex items-start gap-4 overflow-x-auto pb-3">
        {LEAD_STAGES.map((stage) => {
          const column = leads.filter((l) => l.status === stage.id)
          const total = column.reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0)
          const isOver = over === stage.id

          return (
            <section
              key={stage.id}
              aria-label={stage.label}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(stage.id)
              }}
              onDragLeave={() => setOver((c) => (c === stage.id ? null : c))}
              onDrop={() => {
                if (dragging) moveTo(dragging, stage.id)
                setDragging(null)
                setOver(null)
              }}
              className={`w-[272px] shrink-0 rounded-lg transition ${
                isOver ? 'bg-surface-2 p-1.5' : 'p-0'
              }`}
            >
              <header className="flex items-center gap-2 px-1.5 pb-3 pt-0.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: stage.color }}
                />
                <h2 className="text-[13.5px] font-bold">{stage.label}</h2>
                <span className="tabular rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11.5px] text-muted">
                  {column.length}
                </span>
                {total > 0 && (
                  <span className="tabular ml-auto font-mono text-[11.5px] font-semibold text-muted">
                    {formatBRL(total)}
                  </span>
                )}
              </header>

              <div className="flex min-h-[80px] flex-col gap-2.5">
                {column.map((lead) => (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragging(lead.id)}
                    onDragEnd={() => {
                      setDragging(null)
                      setOver(null)
                    }}
                    onClick={() => setOpenLead(lead.id)}
                    className="cursor-pointer rounded-md border bg-surface p-3.5 shadow-[0_1px_2px_rgba(33,30,26,0.05)] transition hover:shadow-[0_4px_12px_rgba(33,30,26,0.08)]"
                    style={{
                      borderColor: lead.hot ? 'transparent' : 'var(--color-line)',
                      borderLeft: lead.hot
                        ? '3px solid var(--color-brand)'
                        : '1px solid var(--color-line)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold">
                          {lead.company || lead.name}
                        </p>
                        <p className="truncate text-[12px] text-muted">
                          {lead.company ? lead.name : 'Pessoa física'}
                        </p>
                      </div>
                      {lead.hot && (
                        <Flame
                          size={15}
                          aria-label="Lead quente"
                          className="shrink-0 text-brand-700"
                        />
                      )}
                    </div>

                    <div className="mt-2.5">
                      <Badge tone={lead.personType === 'PJ' ? 'teal' : 'neutral'}>
                        {lead.personType}
                        {lead.personType === 'PJ' ? ` · ${plural(lead.lives, 'vida')}` : ''}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                      <span className="tabular font-mono text-[13px] font-bold text-ink-2">
                        {lead.estimatedValue ? formatBRL(lead.estimatedValue) : '—'}
                        {lead.estimatedValue ? (
                          <span className="text-[10px] font-medium text-muted">/mês</span>
                        ) : null}
                      </span>
                      {lead.nextContactAt && (
                        <span className="tabular flex items-center gap-1 text-[11.5px] text-muted">
                          <Calendar size={12} aria-hidden />
                          {formatShortDate(lead.nextContactAt)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}

                {column.length === 0 && (
                  <p className="rounded-md border-[1.5px] border-dashed border-line-2 px-2.5 py-5 text-center text-[12px] text-muted-2">
                    Arraste leads para cá
                  </p>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {openLead && (
        <LeadDrawer
          leadId={openLead}
          onClose={() => setOpenLead(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </>
  )
}
