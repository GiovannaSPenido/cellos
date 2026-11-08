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
  CircleCheck,
  MessagesSquare,
  Handshake,
  type LucideIcon,
} from 'lucide-react'
import type {
  QuizAnswers,
  RecommendationResult,
} from '@/contexts/commercial/application/usecases/RecommendPlanUseCase'
import { AGE_BRACKETS } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import { Badge, ProgressBar } from '@/components/ui'
import { maskCNPJ } from '@/lib/format'

type Key = keyof Omit<QuizAnswers, 'lives'>

interface Step {
  key: Key
  title: string
  hint: string
  options: { value: string; label: string; Icon: LucideIcon }[]
}

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:border-teal focus:ring-[3px] focus:ring-teal-50'

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

type Phase = 'questions' | 'result' | 'quote' | 'sent'

export default function PlanQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [phase, setPhase] = useState<Phase>('questions')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cnpj, setCnpj] = useState('')

  const isCompany = answers.audience === 'company'

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
    setPhase('result')
  }

  /**
   * RF06 — the quote request becomes a lead, carrying the quiz answers in the
   * note so the broker opens the funnel already knowing the profile.
   */
  async function requestQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()

    const response = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personType: isCompany ? 'PJ' : 'PF',
        name: text('name'),
        email: text('email'),
        phone: text('phone'),
        company: isCompany ? text('company') : null,
        cnpj: isCompany ? cnpj : null,
        planOfInterest: result?.best.name ?? null,
        message: describeAnswers(answers),
        origin: 'quiz',
      }),
    })
    const payload = await response.json().catch(() => ({}))
    setLoading(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível enviar o pedido agora. Tente novamente.')
      return
    }
    setPhase('sent')
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setResult(null)
    setCnpj('')
    setError(null)
    setPhase('questions')
  }

  /* ------------------------------------------------------------- enviado -- */
  if (phase === 'sent') {
    return (
      <div className="mx-auto max-w-[560px] rounded-lg border border-line bg-surface p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-600">
          <CircleCheck size={34} aria-hidden />
        </span>
        <h1 className="mt-5 text-[26px] font-extrabold">Pedido de cotação enviado</h1>
        <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-relaxed text-muted">
          Um corretor da Cellos entra em contato em breve com os valores do plano recomendado
          e das alternativas, sem nenhum custo.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/operadoras"
            className="rounded-md bg-teal px-5 py-3 text-[14.5px] font-semibold text-white transition hover:bg-teal-600"
          >
            Ver as operadoras
          </Link>
          <button
            type="button"
            onClick={restart}
            className="rounded-md border border-line-2 px-5 py-3 text-[14.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
          >
            Refazer o teste
          </button>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------- pedido de cotação -- */
  if (phase === 'quote') {
    return (
      <div className="mx-auto max-w-[560px]">
        <button
          type="button"
          onClick={() => setPhase('result')}
          className="mb-6 inline-flex items-center gap-2 rounded-sm border border-line-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
        >
          <ArrowLeft size={15} aria-hidden /> Voltar para a recomendação
        </button>

        <form
          onSubmit={requestQuote}
          className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-8"
        >
          <div>
            <h1 className="text-[24px] font-extrabold">Cotação gratuita</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              Suas respostas já estão registradas. Diga só para onde enviamos os valores
              {result ? ` do ${result.best.name}` : ''}.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Nome completo</span>
            <input name="name" required placeholder="Seu nome" className={FIELD} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink-2">Telefone / WhatsApp</span>
              <input name="phone" required placeholder="(31) 99999-0000" className={FIELD} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink-2">E-mail</span>
              <input
                name="email"
                type="email"
                required
                placeholder="voce@email.com"
                className={FIELD}
              />
            </label>
          </div>

          {isCompany && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">Empresa</span>
                <input name="company" required placeholder="Nome da empresa" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">
                  CNPJ <span className="font-normal text-muted">(opcional)</span>
                </span>
                <input
                  name="cnpj"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  className={FIELD}
                />
              </label>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-sm bg-critical-50 px-4 py-3 text-[13.5px] text-critical"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
          >
            <Handshake size={18} aria-hidden />
            {loading ? 'Enviando…' : 'Pedir minha cotação'}
          </button>

          <p className="text-center text-[12px] text-muted">
            Seus dados são usados apenas para o atendimento Cellos.
          </p>
        </form>
      </div>
    )
  }

  /* ----------------------------------------------------------- resultado -- */
  if (phase === 'result' && result) {
    const best = result.best
    return (
      <div className="mx-auto max-w-[880px]">
        <div className="mb-9 text-center">
          <Badge tone="teal" dot>
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
          <header className="bg-brand-700 px-8 py-7 text-white">
            <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] opacity-85">
              Melhor escolha · {best.tier}
            </p>
            <h2 className="mt-1.5 text-[30px] font-extrabold">{best.name}</h2>
            <p className="text-[13.5px] opacity-85">{best.carrier}</p>
          </header>

          <div className="px-8 py-7">
            {best.summary && (
              <p className="text-[15px] leading-relaxed text-ink-2">{best.summary}</p>
            )}

            {best.reasons.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {best.reasons.map((reason) => (
                  <li key={reason}>
                    <Badge tone="teal">✓ {reason}</Badge>
                  </li>
                ))}
              </ul>
            )}

            {/*
              Sem preço na tela, por decisão do cliente na validação de 08/11: os
              valores mudam com frequência e dependem da cidade e da operadora, e
              uma tabela desatualizada cria expectativa que não se cumpre.
            */}
            <div className="mt-7 flex gap-3 rounded-md bg-surface-2 px-5 py-4">
              <MessagesSquare size={19} aria-hidden className="mt-0.5 shrink-0 text-teal-600" />
              <p className="text-[13.5px] leading-relaxed text-ink-2">
                <b className="font-bold">O valor vem por um corretor, não por uma tabela.</b>{' '}
                As mensalidades mudam com frequência e variam conforme a cidade e as condições
                da operadora. Pedimos a cotação exata para o seu perfil, sem custo.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPhase('quote')}
                className="inline-flex items-center gap-2 rounded-md bg-teal px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-teal-600"
              >
                <Handshake size={18} aria-hidden /> Quero cotação gratuita
              </button>
              <Link
                href="/planos"
                className="rounded-md border border-line-2 px-6 py-4 text-[16px] font-semibold text-ink-2 transition hover:bg-surface-2"
              >
                Comparar os planos
              </Link>
            </div>
          </div>
        </article>

        {result.alternatives.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-[18px] font-bold">Também pode te interessar</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.alternatives.map((plan) => (
                <article
                  key={plan.planId}
                  className="min-w-0 rounded-lg border border-line bg-surface p-6"
                >
                  <h3 className="text-[18px] font-bold">{plan.name}</h3>
                  <p className="mt-0.5 text-[12.5px] text-muted">{plan.carrier}</p>
                  {plan.summary && (
                    <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                      {plan.summary}
                    </p>
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
                  : 'border-line-2 bg-surface hover:border-teal hover:bg-teal-50'
              }`}
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-md ${
                  selected ? 'bg-brand-700 text-white' : 'bg-teal-50 text-teal-600'
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

/** Turns the quiz answers into the note that reaches the broker with the lead. */
function describeAnswers(answers: Partial<QuizAnswers>): string {
  const label = (key: Key) => {
    const step = STEPS.find((s) => s.key === key)
    return step?.options.find((o) => o.value === answers[key])?.label ?? null
  }

  const lines: [string, string | null][] = [
    ['Para quem', label('audience')],
    ['Faixa etária', label('ageBracket')],
    ['Prioridade', label('priority')],
    ['Abrangência', label('area')],
    ['Acomodação', label('accommodation')],
  ]

  return [
    'Respostas do Descubra seu plano:',
    ...lines.filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`),
  ].join('\n')
}
