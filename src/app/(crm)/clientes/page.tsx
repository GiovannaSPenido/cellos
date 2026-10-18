import { getContainer } from '@/lib/container'
import PageHeader from '@/components/crm/PageHeader'
import ClientsTable from '@/components/crm/ClientsTable'

export const metadata = { title: 'Clientes — Cellos' }

export default async function ClientesPage() {
  const container = await getContainer()
  const clients = await container.listClients.execute()

  const lives = clients.reduce((sum, c) => sum + c.lives, 0)

  return (
    <>
      <PageHeader
        title="Clientes ativos"
        subtitle={
          clients.length === 0
            ? 'Clientes aparecem aqui quando um lead é convertido'
            : `${clients.length} clientes · ${lives} vidas`
        }
      />

      <div className="px-9 pb-12 pt-6">
        <ClientsTable clients={clients} />
      </div>
    </>
  )
}
