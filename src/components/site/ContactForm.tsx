'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CircleCheck, SendHorizontal } from 'lucide-react'
import type { PersonTypeValue } from '@/contexts/commercial/domain/value-objects/PersonType'

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:border-brand-700 focus:ring-[3px] focus:ring-brand-50'

/** RF09 — the form whose submission becomes a lead (RF06, RNG08). */
export default function ContactForm() {
  const searchParams = useSearchParams()
  const planFromQuery = searchParams.get('plano')
  const origin = searchParams.get('origem') === 'quiz' ? 'quiz' : 'contact-form'

  const [personType, setPersonType] = useState<PersonTypeValue>('PF')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSending(true)

    const form = new FormData(event.currentTarget)

    const response = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personType,
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        company: personType === 'PJ' ? String(form.get('company') ?? '').trim() : null,
        message: String(form.get('message') ?? '').trim() || null,
        planOfInterest: planFromQuery,
        origin,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    setSending(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível enviar agora. Tente novamente.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-deep-50 text-deep">
          <CircleCheck size={34} aria-hidden />
        </span>
        <h2 className="mt-5 text-[24px] font-extrabold">Recebemos sua mensagem!</h2>
        <p className="mx-auto mt-2.5 max-w-[320px] text-[15px] leading-relaxed text-muted">
          Um corretor da Cellos vai entrar em contato em breve pelo canal que você preferir.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-md border border-line-2 px-5 py-3 text-[14.5px] font-semibold text-ink-2 transition hover:bg-surface-2"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-8"
    >
      <h2 className="text-[22px] font-extrabold">Solicite um contato</h2>

      {planFromQuery && (
        <p className="rounded-sm bg-brand-50 px-4 py-3 text-[13.5px] text-brand-700">
          Sobre o plano <b>{planFromQuery}</b>
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Nome completo</span>
        <input name="name" required placeholder="Seu nome" className={FIELD} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">E-mail</span>
          <input
            name="email"
            type="email"
            required
            placeholder="voce@email.com"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Telefone / WhatsApp</span>
          <input name="phone" required placeholder="(31) 99999-0000" className={FIELD} />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-ink-2">
          Você está cotando para
        </legend>
        <div className="flex gap-2.5">
          {(['PF', 'PJ'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPersonType(type)}
              aria-pressed={personType === type}
              className={`flex-1 rounded-md border px-3 py-3 text-[14px] font-semibold transition ${
                personType === type
                  ? 'border-brand-700 bg-brand-50 text-brand-700'
                  : 'border-line-2 text-ink-2 hover:bg-surface-2'
              }`}
            >
              {type === 'PF' ? 'Pessoa física' : 'Empresa'}
            </button>
          ))}
        </div>
      </fieldset>

      {personType === 'PJ' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Empresa</span>
          <input name="company" required placeholder="Nome da empresa" className={FIELD} />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">
          Mensagem <span className="font-normal text-muted">(opcional)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          placeholder="Conte o que você precisa…"
          className={`${FIELD} resize-y`}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-sm bg-critical-50 px-4 py-3 text-[13.5px] text-critical">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-deep disabled:opacity-60"
      >
        <SendHorizontal size={18} aria-hidden />
        {sending ? 'Enviando…' : 'Enviar e receber contato'}
      </button>

      <p className="text-center text-[12px] text-muted">
        Seus dados são usados apenas para o atendimento Cellos.
      </p>
    </form>
  )
}
