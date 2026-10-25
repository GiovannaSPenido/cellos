import Link from 'next/link'
import { Wand2 } from 'lucide-react'
import { loadCatalogue } from '@/lib/catalogue'
import PlanCard from '@/components/site/PlanCard'
import { formatBRL } from '@/lib/format'

export const metadata = {
  title: 'Planos de saúde — Cellos',
  description:
    'Compare os planos de saúde que a Cellos oferece para pessoas físicas e empresas: cobertura, abrangência, acomodação, rede e carência lado a lado.',
}

const COMPARISON: { label: string; of: (p: PlanRow) => string }[] = [
  { label: 'Operadora', of: (p) => p.carrier },
  { label: 'Cobertura', of: (p) => p.coverageType },
  { label: 'Abrangência', of: (p) => p.coverageArea },
  { label: 'Acomodação', of: (p) => p.accommodation },
  { label: 'Coparticipação', of: (p) => (p.hasCoPayment ? 'Com coparticipação' : 'Sem coparticipação') },
  { label: 'Reembolso', of: (p) => (p.hasReimbursement ? 'Sim' : 'Não') },
  { label: 'Rede credenciada', of: (p) => p.network ?? '—' },
  { label: 'Carência principal', of: (p) => p.waitingPeriod ?? '—' },
]

type PlanRow = Awaited<ReturnType<typeof loadCatalogue>>['plans'][number]

export default async function PlanosPage() {
  const { plans, unavailable } = await loadCatalogue()

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <header className="max-w-[680px]">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Planos de saúde
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,42px)] font-extrabold leading-tight">
          Compare os planos e escolha com clareza
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Linhas pensadas para perfis diferentes. Os valores são <em>a partir de</em> — simule
          pela sua faixa etária para o preço exato.
        </p>
      </header>

      {unavailable ? (
        <p className="mt-12 rounded-lg border border-line bg-surface px-6 py-10 text-center text-[15px] text-muted">
          Não foi possível carregar o catálogo agora.{' '}
          <Link href="/contato" className="font-semibold text-brand-700 underline">
            Fale com um corretor
          </Link>{' '}
          e nós enviamos as opções para você.
        </p>
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} detailed />
            ))}
          </div>

          {/* comparação lado a lado */}
          <section className="mt-16">
            <h2 className="mb-5 text-[26px] font-extrabold">Comparação lado a lado</h2>

            <div className="overflow-x-auto rounded-lg border border-line bg-surface">
              <table className="w-full min-w-[720px] border-collapse text-[14px]">
                <caption className="sr-only">
                  Características de cada plano, lado a lado
                </caption>
                <thead>
                  <tr className="bg-surface-2">
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-[13px] font-bold text-muted"
                    >
                      Característica
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        scope="col"
                        className={`px-5 py-4 text-left font-extrabold ${
                          plan.featured ? 'text-brand-700' : 'text-ink'
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-t border-line">
                      <th
                        scope="row"
                        className="px-5 py-3.5 text-left font-semibold text-ink-2"
                      >
                        {row.label}
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-5 py-3.5 text-ink-2">
                          {row.of(plan)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-line bg-surface-2">
                    <th scope="row" className="px-5 py-4 text-left font-bold">
                      Preço a partir de
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-5 py-4">
                        <span className="tabular font-mono text-[16px] font-bold">
                          {formatBRL(plan.basePrice)}
                        </span>
                        <span className="text-[12px] text-muted">/mês</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/descubra"
          className="inline-flex items-center gap-2 rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600"
        >
          <Wand2 size={18} aria-hidden /> Descobrir meu plano ideal
        </Link>
        <Link
          href="/contato"
          className="rounded-md border border-line-2 px-6 py-4 text-[16px] font-semibold text-ink-2 transition hover:bg-surface"
        >
          Falar com um corretor
        </Link>
      </div>
    </div>
  )
}
