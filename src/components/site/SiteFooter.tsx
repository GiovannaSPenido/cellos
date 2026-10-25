import Link from 'next/link'

interface FooterItem {
  label: string
  /** Absent for a plain contact detail, which is not a link. */
  href?: string
}

const COLUMNS: { title: string; items: FooterItem[] }[] = [
  {
    title: 'Planos',
    items: [
      { label: 'Ver todos os planos', href: '/planos' },
      { label: 'Simular preço', href: '/simular' },
      { label: 'Descubra seu plano', href: '/descubra' },
    ],
  },
  {
    title: 'Contato',
    items: [
      { label: '(31) 3000-0000' },
      { label: 'contato@cellos.com.br' },
      { label: 'Seg–Sex, 8h às 18h' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface-2">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-mono text-[16px] font-bold tracking-[0.18em] text-brand-700">
              CELLOS
            </span>
            <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-ink-2">
              Corretora de planos de saúde para pessoas e empresas. Orientação humana, do
              primeiro contato à renovação.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3.5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-[14px] text-ink-2 transition hover:text-brand-700"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-[14px] text-ink-2">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-11 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-muted">
          <span>
            © 2026 Cellos Comércio e Serviços em Planos de Saúde LTDA. · CNPJ
            10.569.183/0001-14
          </span>
          <span>Valores simulados não constituem proposta contratual.</span>
        </div>
      </div>
    </footer>
  )
}
