'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import type { ClientListItem } from '@/contexts/commercial/application/usecases/ListClientsUseCase'
import { Avatar, Badge, Card, EmptyState } from '@/components/ui'
import { CLIENT_STATUS_LABELS, formatBRL, formatShortDate } from '@/lib/format'

type Tab = 'todos' | 'PF' | 'PJ'

const TABS: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'PF', label: 'Pessoa física' },
  { id: 'PJ', label: 'Empresas' },
]

export default function ClientsTable({ clients }: { clients: ClientListItem[] }) {
  const [tab, setTab] = useState<Tab>('todos')
  const [search, setSearch] = useState('')

  // Filtering client-side keeps typing responsive; the list is a few hundred rows.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return clients.filter(
      (c) =>
        (tab === 'todos' || c.personType === tab) &&
        (term === '' || c.name.toLowerCase().includes(term)),
    )
  }, [clients, tab, search])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filtrar por tipo"
          className="flex gap-1.5 rounded-sm bg-surface-2 p-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-[6px] px-4 py-2 text-[13.5px] font-semibold transition ${
                tab === item.id
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(33,30,26,0.06)]'
                  : 'text-muted hover:text-ink-2'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-[280px]">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente…"
            aria-label="Buscar cliente"
            className="w-full rounded-sm border border-line-2 bg-surface py-2.5 pl-10 pr-3 text-[14px] outline-none transition focus:border-brand-700 focus:ring-[3px] focus:ring-brand-50"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            title={clients.length === 0 ? 'Nenhum cliente ainda' : 'Nenhum cliente encontrado'}
            hint={
              clients.length === 0
                ? 'Clientes aparecem aqui quando um lead é convertido.'
                : 'Tente outro termo ou filtro.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[14px]">
              <thead>
                <tr className="bg-surface-2">
                  {['Cliente', 'Tipo', 'Plano', 'Vidas', 'Mensalidade', 'Status', 'Renovação', ''].map(
                    (head, i) => (
                      <th
                        key={head || i}
                        scope="col"
                        className={`whitespace-nowrap px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-muted ${
                          i === 3 || i === 4 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((client) => {
                  const status = CLIENT_STATUS_LABELS[client.status]
                  const days = client.daysUntilRenewal
                  return (
                    <tr key={client.id} className="border-t border-line transition hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Link href={`/clientes/${client.id}`} className="flex items-center gap-3">
                          <Avatar name={client.name} size={34} />
                          <span>
                            <span className="block font-semibold">{client.name}</span>
                            <span className="block text-[12px] text-muted">
                              {client.city ?? '—'}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={client.personType === 'PJ' ? 'deep' : 'neutral'}>
                          {client.personType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-2">{client.planName}</td>
                      <td className="tabular px-4 py-3 text-right font-mono">{client.lives}</td>
                      <td className="tabular px-4 py-3 text-right font-mono font-semibold">
                        {formatBRL(client.monthlyFee)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status.tone} dot>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px]">
                        <span
                          className={
                            days === null
                              ? 'text-muted'
                              : days < 0
                                ? 'text-critical'
                                : days <= 30
                                  ? 'text-[#8a6410]'
                                  : 'text-ink-2'
                          }
                        >
                          {formatShortDate(client.renewsOn)}
                        </span>
                        {days !== null && (
                          <span className="text-[11.5px] text-muted">
                            {' · '}
                            {days < 0 ? 'vencido' : `${days}d`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-2">
                        <Link href={`/clientes/${client.id}`} aria-label={`Abrir ${client.name}`}>
                          <ChevronRight size={16} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
