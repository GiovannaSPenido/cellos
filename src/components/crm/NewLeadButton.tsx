'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import type { PersonTypeValue } from '@/contexts/commercial/domain/value-objects/PersonType'

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-brand-700 focus:ring-[3px] focus:ring-brand-50'

const ORIGINS = ['Prospecção ativa', 'Indicação', 'Instagram', 'Site — cotação', 'Feira / evento']

/** RF01 — every field the requirement names. */
export default function NewLeadButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personType, setPersonType] = useState<PersonTypeValue>('PJ')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const form = new FormData(event.currentTarget)
    const value = String(form.get('estimatedValue') ?? '').trim()
    const lives = String(form.get('lives') ?? '').trim()

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personType,
        name: String(form.get('name') ?? '').trim(),
        company: personType === 'PJ' ? String(form.get('company') ?? '').trim() : null,
        role: String(form.get('role') ?? '').trim() || null,
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        planOfInterest: String(form.get('planOfInterest') ?? '').trim() || null,
        lives: lives ? Number(lives) : personType === 'PJ' ? 2 : 1,
        estimatedValue: value ? Number(value) : null,
        origin: String(form.get('origin') ?? 'Prospecção ativa'),
        notes: String(form.get('notes') ?? '').trim() || null,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    setSaving(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível salvar o lead.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-sm bg-brand-700 px-3.5 py-2 text-[13.5px] font-semibold text-white transition hover:bg-deep"
      >
        <Plus size={16} aria-hidden /> Novo lead
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Novo lead"
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-[2px]"
          />

          <div className="relative max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-lg bg-surface p-7 shadow-[0_24px_60px_-16px_rgba(33,30,26,0.28)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold">Novo lead</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded-sm p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <X size={19} aria-hidden />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <fieldset>
                <legend className="mb-1.5 text-[13px] font-semibold text-ink-2">Tipo</legend>
                <div className="flex gap-2.5">
                  {(['PJ', 'PF'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPersonType(type)}
                      aria-pressed={personType === type}
                      className={`flex-1 rounded-sm border px-3 py-2.5 text-[13.5px] font-semibold transition ${
                        personType === type
                          ? 'border-brand-700 bg-brand-50 text-brand-700'
                          : 'border-line-2 bg-surface text-ink-2 hover:bg-surface-2'
                      }`}
                    >
                      {type === 'PJ' ? 'Empresa' : 'Pessoa física'}
                    </button>
                  ))}
                </div>
              </fieldset>

              {personType === 'PJ' && (
                <Field label="Empresa" name="company" required placeholder="Nome da empresa" />
              )}

              <Field
                label={personType === 'PJ' ? 'Responsável' : 'Nome'}
                name="name"
                required
                placeholder="Nome do contato"
              />

              {personType === 'PJ' && (
                <Field label="Cargo" name="role" placeholder="Sócio, RH, gerente…" />
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefone" name="phone" required placeholder="(31) 99999-0000" />
                <Field label="E-mail" name="email" type="email" required placeholder="nome@email.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={personType === 'PJ' ? 'Vidas' : 'Dependentes + titular'}
                  name="lives"
                  type="number"
                  min={1}
                  defaultValue={personType === 'PJ' ? 2 : 1}
                />
                <Field
                  label="Valor est./mês"
                  name="estimatedValue"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="R$"
                />
              </div>

              <Field label="Plano de interesse" name="planOfInterest" placeholder="Opcional" />

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">Origem</span>
                <select name="origin" className={FIELD} defaultValue={ORIGINS[0]}>
                  {ORIGINS.map((origin) => (
                    <option key={origin}>{origin}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">Observações</span>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="O que você já sabe sobre este contato…"
                  className={`${FIELD} resize-y`}
                />
              </label>

              {error && (
                <p role="alert" className="rounded-sm bg-critical-50 px-3 py-2.5 text-[13px] text-critical">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-sm border border-line-2 px-4 py-2.5 text-[14px] font-semibold text-ink-2 transition hover:bg-surface-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-sm bg-brand-700 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-deep disabled:opacity-60"
                >
                  {saving ? 'Salvando…' : 'Adicionar lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      <input name={name} className={FIELD} {...props} />
    </label>
  )
}
