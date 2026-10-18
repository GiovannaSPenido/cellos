import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Lightbulb } from 'lucide-react'
import { getContainer } from '@/lib/container'
import PageHeader from '@/components/crm/PageHeader'
import { Avatar, Badge, Card, EmptyState } from '@/components/ui'
import {
  CLIENT_STATUS_LABELS,
  INTERACTION_LABELS,
  PERSON_TYPE_LABELS,
  formatBRL,
  formatDate,
} from '@/lib/format'

export default async function ClienteDetalhePage({ params }: PageProps<'/clientes/[id]'>) {
  const { id } = await params
  const container = await getContainer()

  const client = await container.repositories.clients.findById(id)
  if (!client) {
    notFound()
  }

  const [history, plan] = await Promise.all([
    container.getLeadHistory.execute(client.leadId),
    container.repositories.plans.findById(client.planId),
  ])

  const lead = history.lead
  const name = lead.company || lead.name
  const status = CLIENT_STATUS_LABELS[client.status.value]
  const days = client.daysUntilRenewal()

  return (
    <>
      <PageHeader title="Cliente" subtitle={name} />

      <div className="flex flex-col gap-4 px-9 pb-12 pt-6">
        <Link
          href="/clientes"
          className="inline-flex w-fit items-center gap-2 rounded-sm border border-line-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
        >
          <ArrowLeft size={15} aria-hidden /> Voltar para clientes
        </Link>

        {/* cabeçalho */}
        <Card className="flex flex-wrap items-center justify-between gap-5 p-6">
          <div className="flex items-center gap-4">
            <Avatar name={name} size={56} />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[24px] font-extrabold">{name}</h2>
                <Badge tone={status.tone} dot>
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-[14px] text-muted">
                {PERSON_TYPE_LABELS[lead.personType]}
                {client.city ? ` · ${client.city}` : ''}
                {client.contactPerson ? ` · Resp.: ${client.contactPerson}` : ''}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* plano contratado — RNG06 */}
            <Card className="p-6">
              <h3 className="mb-4 text-[16px] font-bold">Plano contratado</h3>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md bg-brand-50 px-5 py-4">
                <div>
                  <p className="text-[18px] font-extrabold">{plan?.name ?? '—'}</p>
                  <p className="text-[13px] text-brand-700">
                    {client.lives} {client.lives > 1 ? 'vidas' : 'vida'}
                    {plan ? ` · ${plan.carrier}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular font-mono text-[22px] font-extrabold">
                    {formatBRL(client.monthlyFee.toPrimitive())}
                  </p>
                  <p className="text-[12px] text-muted">por mês</p>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] text-muted">Início de vigência</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold">{formatDate(client.startsOn)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-muted">Renovação</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold">
                    {formatDate(client.renewsOn)}
                    {days !== null && (
                      <span className={days < 0 ? 'text-critical' : 'text-muted'}>
                        {' '}
                        ({days < 0 ? 'vencido' : `${days}d`})
                      </span>
                    )}
                  </dd>
                </div>
                {plan && (
                  <>
                    <div>
                      <dt className="text-[12px] text-muted">Abrangência</dt>
                      <dd className="mt-0.5 text-[14px] font-semibold">{plan.coverageArea}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-muted">Acomodação</dt>
                      <dd className="mt-0.5 text-[14px] font-semibold">{plan.accommodation}</dd>
                    </div>
                  </>
                )}
              </dl>
            </Card>

            {/* histórico herdado do lead — RNG05 */}
            <Card className="p-6">
              <h3 className="mb-1 text-[16px] font-bold">Histórico de contatos</h3>
              <p className="mb-4 text-[12.5px] text-muted">
                Inclui as interações registradas durante a prospecção.
              </p>

              {history.interactions.length === 0 ? (
                <EmptyState title="Nenhuma interação registrada" />
              ) : (
                <ol className="flex flex-col gap-4">
                  {history.interactions.map((item) => (
                    <li key={item.id} className="flex gap-3.5">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-deep-50 font-mono text-[10px] font-bold text-deep">
                        {INTERACTION_LABELS[item.type].slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-[13.5px] font-bold">
                            {INTERACTION_LABELS[item.type]}
                          </span>
                          <span className="tabular font-mono text-[11.5px] text-muted">
                            {formatDate(item.occurredAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13.5px] leading-snug text-ink-2">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            {/* contato */}
            <Card className="p-6">
              <h3 className="mb-3.5 text-[16px] font-bold">Contato</h3>
              <ul className="flex flex-col">
                {[
                  { Icon: Phone, value: lead.phone },
                  { Icon: Mail, value: lead.email },
                  { Icon: MapPin, value: client.city ?? '—' },
                ].map(({ Icon, value }) => (
                  <li
                    key={value}
                    className="flex items-center gap-3 border-b border-line py-2.5 last:border-0"
                  >
                    <Icon size={16} aria-hidden className="shrink-0 text-muted" />
                    <span className="break-all text-[13.5px]">{value}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* oportunidade — RNG07 */}
            {client.opportunity && (
              <Card className="p-6">
                <h3 className="mb-2.5 flex items-center gap-2 text-[16px] font-bold">
                  <Lightbulb size={17} aria-hidden className="text-brand-700" />
                  Oportunidade
                </h3>
                <p className="text-[13.5px] leading-relaxed text-ink-2">{client.opportunity}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
