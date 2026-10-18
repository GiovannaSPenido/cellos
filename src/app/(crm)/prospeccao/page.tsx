import { getContainer } from '@/lib/container'
import PageHeader from '@/components/crm/PageHeader'
import NewLeadButton from '@/components/crm/NewLeadButton'
import KanbanBoard from '@/components/crm/KanbanBoard'
import { formatBRL } from '@/lib/format'

export const metadata = { title: 'Prospecção — Cellos' }

export default async function ProspeccaoPage() {
  const container = await getContainer()
  const leads = await container.listLeads.execute()

  const open = leads.filter((l) => l.status !== 'CONVERTED' && l.status !== 'LOST')
  const pipeline = open.reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0)

  return (
    <>
      <PageHeader
        title="Prospecção de leads"
        subtitle={
          leads.length === 0
            ? 'Arraste os cards entre as etapas do funil'
            : `${open.length} leads ativos · ${formatBRL(pipeline)} em pipeline`
        }
        actions={<NewLeadButton />}
      />

      <div className="px-9 pb-12 pt-6">
        <KanbanBoard initialLeads={leads} />
      </div>
    </>
  )
}
