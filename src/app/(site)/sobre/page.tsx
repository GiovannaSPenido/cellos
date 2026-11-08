import Link from 'next/link'
import { Handshake, HeartHandshake, ShieldCheck } from 'lucide-react'
import { COMPANY_STATS, REFERENCES } from '@/lib/placeholder'

export const metadata = {
  title: 'Sobre a Cellos — corretora de planos de saúde',
  description:
    'A Cellos intermedeia planos de saúde para pessoas e empresas em Minas Gerais, do primeiro contato à renovação.',
}

const VALUES = [
  {
    Icon: HeartHandshake,
    title: 'Entender antes de propor',
    text: 'A conversa começa pelo que a pessoa precisa, não pelo plano que dá mais comissão.',
  },
  {
    Icon: ShieldCheck,
    title: 'Sem letra miúda',
    text: 'Carência, coparticipação e o que o plano não cobre são ditos antes da assinatura.',
  },
  {
    Icon: Handshake,
    title: 'Acompanhar depois',
    text: 'A corretora continua por perto na inclusão de dependentes, no reajuste e na renovação.',
  },
]

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <header className="max-w-[720px]">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Sobre a Cellos
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,42px)] font-extrabold leading-tight">
          Mais de duas décadas ao lado de quem precisa de plano
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-2">
          A Cellos Comércio e Serviços em Planos de Saúde intermedeia planos para pessoas
          físicas e empresas em Minas Gerais. O trabalho é o mesmo desde o começo: entender
          o que a pessoa precisa antes de apresentar qualquer proposta, e acompanhar da
          contratação à renovação.
        </p>
      </header>

      <section aria-label="Números da corretora" className="mt-12 grid gap-8 sm:grid-cols-3">
        {COMPANY_STATS.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-[34px] font-extrabold tracking-tight text-teal">
                {stat.value}
              </span>
              {stat.pending && (
                <span className="rounded-sm bg-caution-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-[#8a6410]">
                  a confirmar
                </span>
              )}
            </p>
            <p className="mt-1 text-[14px] text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-[26px] font-extrabold">Como a corretora trabalha</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {VALUES.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-md bg-teal-50 text-teal-600">
                <Icon size={21} aria-hidden />
              </span>
              <h3 className="text-[17px] font-bold">{title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-2">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[26px] font-extrabold">Referências comerciais</h2>
        <p className="mt-2 text-[15px] text-muted">
          Operadoras e parceiros com quem a Cellos trabalha.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REFERENCES.map((reference) => (
            <li
              key={reference.name}
              className="min-w-0 rounded-lg border border-line bg-surface px-5 py-4"
            >
              <p className="text-[15px] font-bold">{reference.name}</p>
              <p
                className={`mt-0.5 text-[12.5px] ${
                  reference.pending ? 'text-[#8a6410]' : 'text-muted'
                }`}
              >
                {reference.role}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 flex flex-wrap justify-center gap-3">
        <Link
          href="/operadoras"
          className="rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600"
        >
          Ver as operadoras
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
