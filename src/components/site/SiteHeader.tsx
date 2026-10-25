'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LockKeyhole, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/planos', label: 'Planos' },
  { href: '/simular', label: 'Simular preço' },
  { href: '/descubra', label: 'Descubra seu plano' },
  { href: '/contato', label: 'Contato' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link href="/" className="font-mono text-[16px] font-bold tracking-[0.18em] text-brand-700">
          CELLOS
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-sm px-3.5 py-2 text-[14.5px] font-semibold transition ${
                  active ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-sm border border-line-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-surface-2 sm:inline-flex"
          >
            <LockKeyhole size={15} aria-hidden />
            Área do corretor
          </Link>
          <Link
            href="/descubra"
            className="hidden rounded-sm bg-brand-700 px-3.5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-deep sm:inline-block"
          >
            Encontrar meu plano
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="rounded-sm p-2 text-ink-2 transition hover:bg-surface-2 lg:hidden"
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Principal"
          className="flex flex-col gap-0.5 border-t border-line bg-surface px-6 py-3 lg:hidden"
        >
          {[...LINKS, { href: '/login', label: 'Área do corretor' }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-sm px-3 py-2.5 text-[15px] font-semibold text-ink-2 transition hover:bg-surface-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
