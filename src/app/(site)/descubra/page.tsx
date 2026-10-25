import PlanQuiz from '@/components/site/PlanQuiz'

export const metadata = {
  title: 'Descubra seu plano — Cellos',
  description:
    'Responda cinco perguntas rápidas sobre perfil, faixa etária, prioridade de cobertura, abrangência e acomodação, e receba a recomendação de plano que melhor combina com você.',
}

export default function DescubraPage() {
  return (
    <div className="px-6 py-14">
      <PlanQuiz />
    </div>
  )
}
