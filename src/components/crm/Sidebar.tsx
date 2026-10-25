'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Filter, Users, Globe, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { href: '/prospeccao', label: 'Prospecção', Icon: Filter },
  { href: '/clientes', label: 'Clientes', Icon: Users },
]

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface">
      <div className="px-5 pb-4 pt-6">
        <Logo height={30} />
      </div>

      <nav className="flex flex-col gap-0.5 px-3.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-[14.5px] font-semibold transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-2 hover:bg-surface-2'
              }`}
            >
              <Icon size={19} aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-line p-3.5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-[14px] font-semibold text-ink-2 transition hover:bg-surface-2"
        >
          <Globe size={18} aria-hidden />
          Ver site público
        </Link>

        <div className="flex items-center gap-2.5 px-2 pb-1 pt-2.5">
          <Avatar name={name} size={36} tone="teal" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold">{name}</p>
            <p className="text-[11.5px] text-muted">{role}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sair"
            aria-label="Sair"
            className="rounded-sm p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <LogOut size={18} aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}
