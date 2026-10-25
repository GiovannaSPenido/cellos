import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  UsersRound,
  MessagesSquare,
  ListChecks,
  Scale,
  Handshake,
  Wand2,
  ArrowRight,
} from 'lucide-react'
import { loadCatalogue } from '@/lib/catalogue'
import PlanCard from '@/components/site/PlanCard'

const PROMISES = [
  { Icon: ShieldCheck, title: '100% sem custo', sub: 'para você cotar' },
  { Icon: UsersRound, title: 'PF e PJ', sub: 'pessoas e empresas' },
  { Icon: MessagesSquare, title: 'Atendimento humano', sub: 'de verdade' },
]

const STEPS = [
  {
    n: '01',
    Icon: ListChecks,
    title: 'Conte o que você precisa',
    text: 'Responda algumas perguntas rápidas sobre perfil, idade e prioridades de cobertura.',
  },
  {
    n: '02',
    Icon: Scale,
    title: 'Compare e simule',
    text: 'Veja os planos lado a lado e simule o preço pela sua faixa etária, sem surpresas.',
  },
  {
    n: '03',
    Icon: Handshake,
    title: 'Contrate com apoio',
    text: 'Um corretor da Cellos finaliza tudo com você e acompanha até a ativação.',
  },
]

export default async function HomePage() {
  const { plans } = await loadCatalogue()

  return (
    <>
      {/* hero */}
      <section className="border-b border-line bg-gradient-to-br from-canvas to-surface-2">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-20">
          <div className="max-w-[620px]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Planos de saúde · PF e PJ
            </p>
            <h1 className="mt-4 text-[clamp(34px,6vw,52px)] font-extrabold leading-[1.05]">
              O plano de saúde certo,{' '}
              <span className="text-brand-700">sem complicação.</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[18px] leading-relaxed text-ink-2">
              Encontre o plano ideal para você ou sua empresa. Cotação transparente, sem
              surpresas, com atendimento humano do começo ao fim.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/descubra"
                className="inline-flex items-center gap-2 rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600"
              >
                <Wand2 size={18} aria-hidden /> Descubra seu plano
              </Link>
              <Link
                href="/simular"
                className="inline-flex items-center rounded-md border border-line-2 px-6 py-4 text-[16px] font-semibold text-ink-2 transition hover:bg-surface"
              >
                Simular preço
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-7">
              {PROMISES.map(({ Icon, title, sub }) => (
                <li key={title} className="flex items-start gap-2.5">
                  <Icon size={21} aria-hidden className="mt-0.5 shrink-0 text-teal-600" />
                  <span>
                    <span className="block text-[14px] font-bold">{title}</span>
                    <span className="block text-[12.5px] text-muted">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[280px] w-full overflow-hidden rounded-xl shadow-[0_18px_40px_-12px_rgba(33,30,26,0.18)] sm:h-[360px] lg:h-[400px]">
            <Image
              src="/hero-cellos.avif"
              alt="Médica auscultando um paciente sorridente durante uma consulta"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* como funciona */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-11 text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Como funciona
            </p>
            <h2 className="mt-3 text-[clamp(26px,4vw,34px)] font-extrabold">
              Do interesse à contratação em 3 passos
            </h2>
          </div>

          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map(({ n, Icon, title, text }) => (
              <li
                key={n}
                className="rounded-lg border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(33,30,26,0.05)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-teal-50 text-teal-600">
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className="tabular font-mono text-[24px] font-semibold text-line-2">
                    {n}
                  </span>
                </div>
                <h3 className="text-[19px] font-bold">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* planos */}
      {plans.length > 0 && (
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Nossos planos
                </p>
                <h2 className="mt-3 text-[clamp(26px,4vw,34px)] font-extrabold">
                  Opções para cada momento
                </h2>
              </div>
              <Link
                href="/planos"
                className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-brand-700 transition hover:text-teal-600"
              >
                Ver todos os planos <ArrowRight size={16} aria-hidden />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* descubra */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal to-teal-600 px-8 py-14 text-white sm:px-14">
          <span
            aria-hidden
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand/15"
          />
          <span
            aria-hidden
            className="absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-brand/10"
          />
          <div className="relative max-w-[520px]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Ferramenta gratuita
            </p>
            <h2 className="mt-3 text-[clamp(26px,4vw,34px)] font-extrabold">
              Descubra o melhor plano para você
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-white/75">
              Um guia interativo de cinco passos que entende seu perfil e recomenda o plano
              ideal — em menos de dois minutos.
            </p>
            <Link
              href="/descubra"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-4 text-[16px] font-semibold text-teal-600 transition hover:bg-brand-50"
            >
              <Wand2 size={18} aria-hidden /> Começar agora
            </Link>
          </div>
        </div>
      </section>

      {/* contato */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-line bg-surface p-10">
          <div>
            <h2 className="text-[26px] font-extrabold">Prefere falar com alguém?</h2>
            <p className="mt-2 text-[16px] text-muted">
              Atendimento humano por telefone, e-mail ou WhatsApp.
            </p>
          </div>
          <Link
            href="/contato"
            className="rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600"
          >
            Falar com a Cellos
          </Link>
        </div>
      </section>
    </>
  )
}
