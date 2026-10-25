import Link from 'next/link'
import { Filter, FileText, Users, TrendingUp, ArrowRight, CalendarClock } from 'lucide-react'
import { getContainer } from '@/lib/container'
import { requireUser } from '@/lib/auth'
import PageHeader from '@/components/crm/PageHeader'
import NewLeadButton from '@/components/crm/NewLeadButton'
import { Avatar, Badge, Card, Donut, EmptyState, Funnel, Stat } from '@/components/ui'
import {
  INTERACTION_LABELS,
  LEAD_STAGES,
  formatBRL,
  formatDate,
  formatShortDate,
  plural,
  stageOf,
} from '@/lib/format'

export const metadata = { title: 'Dashboard — Cellos' }

/** Renewals inside this window are worth acting on now (RNG07). */
const AGENDA_HORIZON_DAYS = 14

export default async function DashboardPage() {
  const user = await requireUser()
  const container = await getContainer()

  const horizon = new Date()
  horizon.setDate(horizon.getDate() + AGENDA_HORIZON_DAYS)

  // Row level security already scopes these to the caller, so no filter is
  // passed: an administrator sees everything, a salesperson only their own.
  const [leads, clients, opportunities, recent, dueForContact] = await Promise.all([
    container.listLeads.execute(),
    container.listClients.execute(),
    container.identifyOpportunities.execute(),
    container.repositories.interactions.findRecent(5),
    container.repositories.leads.findDueForContact(horizon),
  ])

  const open = leads.filter((l) => l.status !== 'CONVERTED' && l.status !== 'LOST')
  const proposals = leads.filter(
    (l) => l.status === 'PROPOSAL_SENT' || l.status === 'NEGOTIATION',
  )
  const proposalValue = proposals.reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0)
  const awaitingFirstContact = leads.filter((l) => l.status === 'NEW').length

  const mrr = clients.reduce((sum, c) => sum + c.monthlyFee, 0)
  const lives = clients.reduce((sum, c) => sum + c.lives, 0)

  const converted = leads.filter((l) => l.status === 'CONVERTED').length
  const stages = LEAD_STAGES.map((stage) => ({
    ...stage,
    count: leads.filter((l) => l.status === stage.id).length,
  }))

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const leadNames = new Map(leads.map((l) => [l.id, l.company || l.name]))

  return (
    <>
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}`}
        subtitle={`Visão geral · ${today}`}
        actions={<NewLeadButton />}
      />

      <div className="flex flex-col gap-5 px-9 pb-12 pt-6">
        {/* indicadores */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Leads ativos"
            value={open.length}
            icon={<Filter size={17} aria-hidden />}
            sub={`${awaitingFirstContact} aguardando 1º contato`}
          />
          <Stat
            label="Propostas em aberto"
            value={formatBRL(proposalValue)}
            icon={<FileText size={17} aria-hidden />}
            tone="brand"
            sub={`${proposals.length} em negociação`}
          />
          <Stat
            label="Clientes ativos"
            value={clients.length}
            icon={<Users size={17} aria-hidden />}
            sub={`${plural(lives, 'vida')} no total`}
          />
          <Stat
            label="Receita mensal"
            value={formatBRL(mrr)}
            icon={<TrendingUp size={17} aria-hidden />}
            tone="brand"
            sub="recorrente (MRR)"
          />
        </div>

        {/* funil e conversão */}
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold">Funil de prospecção</h2>
                <p className="mt-0.5 text-[13px] text-muted">Leads por etapa</p>
              </div>
              <Link
                href="/prospeccao"
                className="inline-flex items-center gap-1.5 rounded-sm border border-line-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
              >
                Abrir kanban <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            {leads.length === 0 ? (
              <EmptyState title="Nenhum lead cadastrado" hint="Comece adicionando um lead." />
            ) : (
              <Funnel stages={stages} />
            )}
          </Card>

          <Card className="flex flex-col items-center justify-center gap-3.5 p-6">
            <h2 className="self-start text-[17px] font-bold">Conversão</h2>
            <Donut value={converted} total={leads.length} label="fechados" />
            <p className="text-center text-[13px] text-muted">
              {converted} de {leads.length} leads viraram contrato
            </p>
          </Card>
        </div>

        {/* os três blocos que faltavam no protótipo */}
        <div className="grid gap-4 xl:grid-cols-3">
          {/* próximos contatos */}
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 text-[15px] font-bold">
              Próximos contatos
            </h2>
            {dueForContact.length === 0 ? (
              <EmptyState title="Nada agendado" hint={`Nos próximos ${AGENDA_HORIZON_DAYS} dias.`} />
            ) : (
              <ul>
                {dueForContact.slice(0, 5).map((lead) => (
                  <li key={lead.id} className="border-b border-line last:border-0">
                    <Link
                      href={`/prospeccao?lead=${lead.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-2"
                    >
                      <Avatar name={lead.displayName} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold">{lead.displayName}</p>
                        <p className="text-[12px] text-muted">
                          {stageOf(lead.status.value).label}
                        </p>
                      </div>
                      <span className="tabular shrink-0 text-[12.5px] font-semibold text-muted">
                        {formatShortDate(lead.nextContactAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* renovações e oportunidades */}
          <Card className="overflow-hidden">
            <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-bold">
              <CalendarClock size={16} aria-hidden className="text-brand-700" />
              Oportunidades
            </h2>
            {opportunities.length === 0 ? (
              <EmptyState title="Nenhuma oportunidade" hint="Renovações aparecem aqui." />
            ) : (
              <ul>
                {opportunities.slice(0, 5).map((item, index) => (
                  <li
                    key={`${item.clientId}-${item.kind}-${index}`}
                    className="border-b border-line last:border-0"
                  >
                    <Link
                      href={`/clientes/${item.clientId}`}
                      className="flex flex-col gap-1 px-5 py-3 transition hover:bg-surface-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13.5px] font-semibold">{item.name}</span>
                        <Badge
                          tone={item.kind === 'OVERDUE_RENEWAL' ? 'critical' : 'caution'}
                          dot
                        >
                          {item.kind === 'UPGRADE' ? 'Upgrade' : 'Renovação'}
                        </Badge>
                      </div>
                      <span className="text-[12px] leading-snug text-muted">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* atividade recente */}
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 text-[15px] font-bold">
              Atividade recente
            </h2>
            {recent.length === 0 ? (
              <EmptyState title="Nenhuma interação" hint="Registre o primeiro contato." />
            ) : (
              <ul>
                {recent.map((item) => {
                  const data = item.toPrimitive()
                  return (
                    <li
                      key={data.id}
                      className="flex flex-col gap-1 border-b border-line px-5 py-3 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">
                          {leadNames.get(data.leadId) ?? 'Lead'}
                        </span>
                        <span className="tabular shrink-0 text-[11.5px] text-muted">
                          {formatDate(data.occurredAt)}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[12.5px] leading-snug text-muted">
                        <span className="font-semibold text-ink-2">
                          {INTERACTION_LABELS[data.type]}
                        </span>
                        {' · '}
                        {data.description}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
