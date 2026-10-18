import Sidebar from '@/components/crm/Sidebar'
import { requireUser } from '@/lib/auth'

/**
 * Everything in this group sits behind authentication (RNF01). The proxy
 * already redirects an anonymous visitor; this is the second gate, so a
 * misconfigured matcher cannot expose a page on its own.
 */
export default async function CrmLayout({ children }: LayoutProps<'/'>) {
  const user = await requireUser()

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar name={user.name} role={user.isAdmin() ? 'Administrador' : 'Corretor'} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
