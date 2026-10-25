import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import type { HealthPlanPrimitive } from '@/contexts/commercial/domain/entities/HealthPlan'
import { Badge } from '@/components/ui'
import { formatBRL } from '@/lib/format'

export default function PlanCard({
  plan,
  detailed = false,
}: {
  plan: HealthPlanPrimitive
  detailed?: boolean
}) {
  return (
    <article
      className={`relative flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-[0_1px_2px_rgba(33,30,26,0.05)] ${
        plan.featured ? 'border-2 border-brand' : 'border border-line'
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-6">
          <Badge tone="brand" dot>
            Mais escolhido
          </Badge>
        </span>
      )}

      <header>
        <p className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-deep">
          {plan.tier}
        </p>
        <h3 className="mt-1 text-[21px] font-extrabold">{plan.name}</h3>
        <p className="mt-0.5 text-[12.5px] text-muted">{plan.carrier}</p>
      </header>

      <div>
        <p className="text-[12.5px] text-muted">a partir de</p>
        <p className="flex items-baseline gap-1">
          <span className="tabular text-[30px] font-extrabold tracking-tight">
            {formatBRL(plan.basePrice)}
          </span>
          <span className="text-[14px] font-semibold text-muted">/mês</span>
        </p>
      </div>

      {plan.summary && (
        <p className="text-[13.5px] leading-relaxed text-ink-2">{plan.summary}</p>
      )}

      <ul className="flex flex-col gap-2">
        {(detailed ? plan.includes : plan.includes.slice(0, 4)).map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-ink-2">
            <CircleCheck size={16} aria-hidden className="mt-0.5 shrink-0 text-deep" />
            {item}
          </li>
        ))}
      </ul>

      {detailed && plan.excludes.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-line pt-3">
          {plan.excludes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[12.5px] text-muted">
              <span aria-hidden className="mt-1 h-1 w-3 shrink-0 rounded-full bg-muted-2" />
              Não inclui: {item}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/simular"
        className={`mt-auto rounded-sm px-4 py-2.5 text-center text-[14px] font-semibold transition ${
          plan.featured
            ? 'bg-brand-700 text-white hover:bg-deep'
            : 'border border-line-2 text-ink-2 hover:bg-surface-2'
        }`}
      >
        Simular preço
      </Link>
    </article>
  )
}
