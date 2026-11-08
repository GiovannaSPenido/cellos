import { requireUser } from '@/lib/auth'
import { AGE_BRACKETS } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import PageHeader from '@/components/crm/PageHeader'
import PriceSimulator from '@/components/crm/PriceSimulator'

export const metadata = { title: 'Cotação — Cellos' }

/**
 * RF11 — simulação de preço por faixa etária e tipo de contratação.
 *
 * Na validação de 08/11 o cliente pediu que a simulação saísse do site: os
 * valores mudam com frequência e uma tabela pública cria expectativa que a
 * operadora pode não cumprir. O cálculo em si continua sendo necessário, então
 * virou ferramenta do corretor — ele simula aqui antes de responder à cotação
 * que chegou pelo site.
 */
export default async function CotacaoPage() {
  await requireUser()

  // The bands are domain constants, so the page renders even with the database down.
  const ageBrackets = AGE_BRACKETS.map(({ code, label }) => ({ code, label }))

  return (
    <>
      <PageHeader
        title="Cotação"
        subtitle="Valores estimados pelas faixas da ANS. O preço final varia conforme cidade e condições da operadora."
      />
      <div className="px-9 pb-12 pt-6">
        <PriceSimulator ageBrackets={ageBrackets} />
      </div>
    </>
  )
}
