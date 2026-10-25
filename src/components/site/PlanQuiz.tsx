'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Users,
  Building2,
  Cake,
  PiggyBank,
  Stethoscope,
  ShieldCheck,
  Baby,
  MapPin,
  Map,
  Globe2,
  BedDouble,
  DoorOpen,
  ArrowLeft,
  RotateCcw,
  Handshake,
  type LucideIcon,
} from 'lucide-react'
import type {
  QuizAnswers,
  RecommendationResult,
} from '@/contexts/commercial/application/usecases/RecommendPlanUseCase'
import { AGE_BRACKETS } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import { Badge, ProgressBar } from '@/components/ui'
import { formatBRL } from '@/lib/format'

type Key = keyof Omit<QuizAnswers, 'lives'>

interface Step {
  key: Key
  title: string
  hint: string
  options: { value: string; label: string; Icon: LucideIcon }[]
}

/** The five questions of RF12, in order. */
const STEPS: Step[] = [
  {
    key: 'audience',
    title: 'Para quem é o plano?',
    hint: 'Vamos entender o contexto.',
    options: [
      { value: 'self', label: 'Pra mim', Icon: User },
      { value: 'family', label: 'Minha família', Icon: Users },
      { value: 'company', label: 'Minha empresa', Icon: Building2 },
    ],
  },
  {
    key: 'ageBracket',
    title: 'Qual a faixa etária principal?',
    hint: 'Do titular ou da maioria das vidas.',
    options: AGE_BRACKETS.map((b) => ({ value: b.code, label: b.label, Icon: Cake })),
  },
  {
    key: 'priority',
    title: 'O que é mais importante pra você?',
    hint: 'Escolha a sua prioridade número 1.',
    options: [
      { value: 'price', label: 'Menor mensalidade', Icon: PiggyBank },
      { value: 'network', label: 'Boa rede de hospitais', Icon: Stethoscope },
      { value: 'coverage', label: 'Cobertura mais completa', Icon: ShieldCheck },
      { value: 'maternity', label: 'Maternidade / parto', Icon: Baby },
    ],
  },
  {
    key: 'area',
    title: 'Onde você quer ser atendido?',
    hint: 'Abrangência da rede.',
    options: [
      { value: 'regional', label: 'Na minha região', Icon: MapPin },
      { value: 'statewide', label: 'No meu estado', Icon: Map },
      { value: 'nationwide', label: 'Em todo o Brasil', Icon: Globe2 },
    ],
  },
  {
    key: 'accommodation',
    title: 'Preferência de internação?',
    hint: 'Caso precise de hospital.',
    options: [
      { value: 'any', label: 'Tanto faz', Icon: BedDouble },
      { value: 'ward', label: 'Enfermaria está ok', Icon: BedDouble },
      { value: 'private', label: 'Quarto privativo', Icon: DoorOpen },
    ],
  },
]

export default function PlanQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function choose(key: Key, value: string) {
    const next = { ...answers, [key]: value }
    setAnswers(next)

    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError(null)

    const response = await fetch('/api/recomendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...next, lives: next.audience === 'company' ? 5 : 1 }),
    })
    const payload = await response.json().catch(() => ({}))
    setLoading(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível montar a recomendação agora.')
      return
    }
    setResult(payload)
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setResult(null)
    setError(null)
  }

  /* ----------------------------------------------------------- resultado -- */
  if (result) {
    const best = result.best
    return (
      <div className="mx-auto max-w-[880px]">
        <div className="mb-9 text-center">
          <Badge tone="deep" dot>
            Sua recomendação
          </Badge>
          <h1 className="mt-4 text-[clamp(28px,5vw,38px)] font-extrabold">
            Encontramos o plano ideal pra você
          </h1>
          <p className="mt-2.5 text-[16px] text-muted">
            Com base nas suas respostas, este é o que melhor combina:
          </p>
        </div>

        <article className="overflow-hidden rounded-lg border-2 border-brand bg-surface shadow-[0_18px_40px_-12px_rgba(33,30,26,0.18)]">
          <header className="flex flex-wrap items-center justify-between gap-5 bg-brand-700 px-8 py-7 text-white">
            <div>
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] opacity-85">
                Melhor escolha · {best.tier}
              </p>
              <h2 className="mt-1.5 text-[30px] font-extrabold">{best.name}</h2>
              <p className="text-[13.5px] opacity-85">{best.carrier}</p>
            </div>
            <div className="text-right">
              <p className="text-[12.5px] opacity-85">
                estimativa {result.ageBracketLabel.toLowerCase()}
              </p>
              <p className="tabular text-[34px] font-extrabold tracking-tight">
                {formatBRL(best.estimatedPrice)}
                <span className="text-[15px] font-semibold opacity-85">/mês</span>
              </p>
            </div>
          </header>

          <div className="px-8 py-7">
            {best.summary && (
              <p className="text-[15px] leading-relaxed text-ink-2">{best.summary}</p>
            )}

            {best.reasons.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {best.reasons.map((reason) => (
                  <li key={reason}>
                    <Badge tone="deep">✓ {reason}</Badge>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/contato?plano=${encodeURIComponent(best.name)}&origem=quiz`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-deep"
              >
                <Handshake size={18} aria-hidden /> Quero contratar
              </Link>
              <Link
                href="/simular"
                className="rounded-md border border-line-2 px-6 py-4 text-[16px] font-semibold text-ink-2 transition hover:bg-surface-2"
              >
                Simular outras faixas
              </Link>
            </div>
          </div>
        </article>

        {result.alternatives.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-[18px] font-bold">Também pode te interessar</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.alternatives.map((plan) => (
                <article key={plan.planId} className="rounded-lg border border-line bg-surface p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[18px] font-bold">{plan.name}</h3>
                    <span className="tabular shrink-0 font-mono text-[15px] font-bold">
                      {formatBRL(plan.estimatedPrice)}
                      <span className="text-[11px] font-medium text-muted">/mês</span>
                    </span>
                  </div>
                  {plan.summary && (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{plan.summary}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-md border border-line-2 px-5 py-3 text-[14.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
          >
            <RotateCcw size={16} aria-hidden /> Refazer o teste
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------ perguntas -- */
  const current = STEPS[step]
  const chosen = answers[current.key]

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-9 flex items-center gap-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
          aria-label="Voltar"
          className="rounded-sm border border-line-2 p-2.5 text-ink-2 transition hover:bg-surface-2 disabled:opacity-40"
        >
          <ArrowLeft size={16} aria-hidden />
        </button>
        <div className="flex-1">
          <ProgressBar
            percent={(step / STEPS.length) * 100}
            color="var(--color-brand-700)"
            height={6}
          />
        </div>
        <span className="tabular font-mono text-[12.5px] font-semibold text-muted">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
        Descubra seu plano
      </p>
      <h1 className="mt-3 text-[clamp(26px,4.5vw,34px)] font-extrabold">{current.title}</h1>
      <p className="mt-2 text-[16px] text-muted">{current.hint}</p>

      {error && (
        <p role="alert" className="mt-5 rounded-md bg-critical-50 px-5 py-4 text-[14px] text-critical">
          {error}
        </p>
      )}

      <div
        role="radiogroup"
        aria-label={current.title}
        /* Fixed class: Tailwind cannot see a column count built at runtime. */
        className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {current.options.map(({ value, label, Icon }) => {
          const selected = chosen === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={loading}
              onClick={() => choose(current.key, value)}
              className={`flex flex-col gap-3.5 rounded-lg border-[1.5px] p-5 text-left transition disabled:opacity-60 ${
                selected
                  ? 'border-brand-700 bg-brand-50 shadow-[0_4px_12px_rgba(33,30,26,0.06)]'
                  : 'border-line-2 bg-surface hover:border-deep hover:bg-deep-50'
              }`}
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-md ${
                  selected ? 'bg-brand-700 text-white' : 'bg-deep-50 text-deep'
                }`}
              >
                <Icon size={22} aria-hidden />
              </span>
              <span className="text-[16px] font-bold">{label}</span>
            </button>
          )
        })}
      </div>

      {loading && <p className="mt-6 text-[14px] text-muted">Montando sua recomendação…</p>}
    </div>
  )
}
