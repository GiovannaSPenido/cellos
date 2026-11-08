import Link from 'next/link'
import { Wand2 } from 'lucide-react'
import { CARRIERS } from '@/lib/placeholder'
import CarrierDirectory from '@/components/site/CarrierDirectory'

export const metadata = {
  title: 'Operadoras parceiras — Cellos',
  description:
    'Conheça as operadoras de planos médicos e odontológicos que a Cellos representa, para pessoas físicas e para empresas.',
}

export default function OperadorasPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <header className="max-w-[680px]">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Operadoras parceiras
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,42px)] font-extrabold leading-tight">
          Com quem a Cellos trabalha
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          A corretora não é dona de nenhum plano — ela representa operadoras e encontra,
          entre elas, a que atende melhor o seu caso. Planos médicos e odontológicos, para
          pessoa física e para empresa.
        </p>
      </header>

      <CarrierDirectory carriers={CARRIERS} />

      <div className="mt-14 flex flex-wrap justify-center gap-3">
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
