import { AGE_BRACKETS } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import PriceSimulator from '@/components/site/PriceSimulator'

export const metadata = {
  title: 'Simular preço — Cellos',
  description:
    'Simule o valor mensal do seu plano de saúde pela faixa etária e pelo tipo de contratação, para pessoa física ou empresa.',
}

export default function SimularPage() {
  // The bands are domain constants, so the page renders even with the database down.
  const ageBrackets = AGE_BRACKETS.map(({ code, label }) => ({ code, label }))

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <header className="max-w-[620px]">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Simulação
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,42px)] font-extrabold leading-tight">
          Simule o preço do seu plano
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Valores estimados pela faixa etária, seguindo as faixas da ANS. O preço final pode
          variar conforme cidade e condições da operadora.
        </p>
      </header>

      <PriceSimulator ageBrackets={ageBrackets} />
    </div>
  )
}
