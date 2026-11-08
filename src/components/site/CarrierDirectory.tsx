'use client'

import { useState } from 'react'
import { Stethoscope, Smile } from 'lucide-react'
import type { CarrierPlaceholder } from '@/lib/placeholder'
import { Badge } from '@/components/ui'

type Filter = 'all' | 'MEDICAL' | 'DENTAL' | 'INDIVIDUAL' | 'CORPORATE'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'MEDICAL', label: 'Planos médicos' },
  { value: 'DENTAL', label: 'Odontológicos' },
  { value: 'INDIVIDUAL', label: 'Pessoa física' },
  { value: 'CORPORATE', label: 'Empresarial' },
]

function matches(carrier: CarrierPlaceholder, filter: Filter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'MEDICAL':
    case 'DENTAL':
      return carrier.kind === filter
    // 'BOTH' atende os dois lados, então aparece nos dois filtros.
    case 'INDIVIDUAL':
    case 'CORPORATE':
      return carrier.audience === filter || carrier.audience === 'BOTH'
  }
}

export default function CarrierDirectory({ carriers }: { carriers: CarrierPlaceholder[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = carriers.filter((carrier) => matches(carrier, filter))

  return (
    <>
      <div role="group" aria-label="Filtrar operadoras" className="mt-9 flex flex-wrap gap-2.5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${
              filter === value
                ? 'border-deep bg-deep text-canvas'
                : 'border-line-2 text-ink-2 hover:bg-surface-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-5 text-[13.5px] text-muted">
        {visible.length === 1 ? '1 operadora' : `${visible.length} operadoras`}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((carrier) => {
          const isDental = carrier.kind === 'DENTAL'
          const Icon = isDental ? Smile : Stethoscope

          return (
            <article
              key={carrier.slug}
              className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface p-6"
            >
              <header className="flex items-start gap-3.5">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${
                    isDental ? 'bg-brand-50 text-brand-700' : 'bg-teal-50 text-teal-600'
                  }`}
                >
                  <Icon size={21} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p
                    className={`font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] ${
                      isDental ? 'text-brand-700' : 'text-teal-600'
                    }`}
                  >
                    {isDental ? 'Odontológico' : 'Plano médico'}
                  </p>
                  <h2 className="mt-0.5 text-[19px] font-extrabold">{carrier.name}</h2>
                </div>
              </header>

              <p className="text-[13.5px] leading-relaxed text-ink-2">{carrier.summary}</p>

              <ul className="mt-auto flex flex-wrap gap-2">
                {carrier.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Badge tone="neutral">{highlight}</Badge>
                  </li>
                ))}
              </ul>

              {carrier.pending && (
                <p className="rounded-sm bg-caution-50 px-3 py-2 text-[12px] font-semibold text-[#8a6410]">
                  Nome e detalhes a confirmar com a corretora
                </p>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
