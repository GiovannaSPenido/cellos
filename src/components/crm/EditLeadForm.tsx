'use client'

import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import type { LeadPrimitive } from '@/contexts/commercial/domain/entities/Lead'
import { maskCNPJ, toInputDate } from '@/lib/format'

const FIELD =
  'w-full rounded-sm border border-line-2 bg-surface px-3 py-2.5 text-[14px] outline-none transition focus:border-teal focus:ring-[3px] focus:ring-teal-50'

const ORIGINS = ['Prospecção ativa', 'Indicação', 'Instagram', 'Site — cotação', 'Feira / evento']

/** RF04 — edit a lead's details. */
export default function EditLeadForm({
  lead,
  onBack,
  onSaved,
}: {
  lead: LeadPrimitive
  onBack: () => void
  onSaved: (updated: LeadPrimitive) => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hot, setHot] = useState(lead.hot)
  const [cnpj, setCnpj] = useState(maskCNPJ(lead.cnpj ?? ''))

  const isCompany = lead.personType === 'PJ'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()
    const nextContact = text('nextContactAt')
    const value = text('estimatedValue')

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: text('name'),
        company: isCompany ? text('company') : null,
        cnpj: isCompany ? cnpj : null,
        role: text('role') || null,
        email: text('email'),
        phone: text('phone'),
        planOfInterest: text('planOfInterest') || null,
        lives: Number(form.get('lives')),
        estimatedValue: value === '' ? null : Number(value),
        origin: text('origin') || null,
        nextContactAt: nextContact || null,
        notes: text('notes') || null,
        hot,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    setSaving(false)

    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível salvar as alterações.')
      return
    }

    onSaved(payload.lead)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-line-2 px-3 py-1.5 text-[13px] font-semibold text-ink-2 transition hover:bg-surface-2"
      >
        <ArrowLeft size={14} aria-hidden /> Cancelar
      </button>

      <h3 className="text-[17px] font-extrabold">Editar lead</h3>

      {isCompany && (
        <Field label="Empresa" name="company" defaultValue={lead.company ?? ''} required />
      )}

      <Field
        label={isCompany ? 'Responsável' : 'Nome'}
        name="name"
        defaultValue={lead.name}
        required
      />

      {isCompany && (
        <>
          <Field label="Cargo" name="role" defaultValue={lead.role ?? ''} />
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">CNPJ</span>
            <input
              inputMode="numeric"
              value={cnpj}
              onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              className={FIELD}
            />
          </label>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" name="phone" defaultValue={lead.phone} required />
        <Field label="E-mail" name="email" type="email" defaultValue={lead.email} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Vidas" name="lives" type="number" min={1} defaultValue={lead.lives} />
        <Field
          label="Valor est./mês"
          name="estimatedValue"
          type="number"
          min={0}
          step="0.01"
          defaultValue={lead.estimatedValue ? lead.estimatedValue / 100 : ''}
          placeholder="R$"
        />
      </div>

      <Field
        label="Plano de interesse"
        name="planOfInterest"
        defaultValue={lead.planOfInterest ?? ''}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Origem</span>
          <select name="origin" className={FIELD} defaultValue={lead.origin ?? ORIGINS[0]}>
            {[...new Set([lead.origin, ...ORIGINS].filter(Boolean))].map((origin) => (
              <option key={origin as string}>{origin}</option>
            ))}
          </select>
        </label>
        <Field
          label="Próximo contato"
          name="nextContactAt"
          type="date"
          defaultValue={toInputDate(lead.nextContactAt)}
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Observações</span>
        <textarea name="notes" rows={2} defaultValue={lead.notes ?? ''} className={`${FIELD} resize-y`} />
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-sm bg-surface-2 px-3 py-2.5">
        <input
          type="checkbox"
          checked={hot}
          onChange={(e) => setHot(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-brand-700)]"
        />
        <span className="text-[13.5px] font-semibold text-ink-2">
          Lead quente — prioridade no funil
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-sm bg-critical-50 px-3 py-2.5 text-[13px] text-critical">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-sm bg-teal px-4 py-3 text-[14.5px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
      >
        <Check size={17} aria-hidden />
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
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
