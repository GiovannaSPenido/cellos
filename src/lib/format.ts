import type { LeadStatusValue } from '@/contexts/commercial/domain/value-objects/LeadStatus'
import type { ClientStatusValue } from '@/contexts/commercial/domain/value-objects/ClientStatus'
import type { InteractionTypeValue } from '@/contexts/commercial/domain/value-objects/InteractionType'
import type { BadgeTone } from '@/components/ui'

/** Money crosses the application boundary as integer cents. */
export function formatBRL(cents: number, withDecimals = false): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** `YYYY-MM-DD` for a date input, read from the local calendar. */
export function toInputDate(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/* ------------------------------------------------------- funnel stages --- */

/** The six stages of RF05, in the order they appear on the board. */
export const LEAD_STAGES: {
  id: LeadStatusValue
  label: string
  color: string
  tone: BadgeTone
}[] = [
  { id: 'NEW', label: 'A contatar', color: 'var(--color-muted-2)', tone: 'neutral' },
  { id: 'IN_CONTACT', label: 'Em contato', color: 'var(--color-teal)', tone: 'teal' },
  { id: 'PROPOSAL_SENT', label: 'Proposta enviada', color: 'var(--color-caution)', tone: 'caution' },
  { id: 'NEGOTIATION', label: 'Negociação', color: 'var(--color-brand)', tone: 'brand' },
  { id: 'CONVERTED', label: 'Fechado', color: 'var(--color-positive)', tone: 'positive' },
  { id: 'LOST', label: 'Perdido', color: 'var(--color-critical)', tone: 'critical' },
]

export function stageOf(status: LeadStatusValue) {
  return LEAD_STAGES.find((stage) => stage.id === status) ?? LEAD_STAGES[0]
}

/* ------------------------------------------------------- client status --- */

export const CLIENT_STATUS_LABELS: Record<ClientStatusValue, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Ativo', tone: 'positive' },
  RENEWAL_DUE: { label: 'Renovação próxima', tone: 'caution' },
  OVERDUE: { label: 'Inadimplente', tone: 'critical' },
  CANCELLED: { label: 'Cancelado', tone: 'neutral' },
}

/* ---------------------------------------------------- interaction types --- */

export const INTERACTION_LABELS: Record<InteractionTypeValue, string> = {
  CALL: 'Ligação',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  MEETING: 'Reunião',
  NOTE: 'Nota',
}

export const PERSON_TYPE_LABELS = {
  PF: 'Pessoa física',
  PJ: 'Empresa',
} as const

/**
 * Agreement for counted nouns: "1 vida" but "2 vidas".
 * Pass the plural only when it is not formed by adding an "s".
 */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? singular + 's')}`
}

/* ------------------------------------------------------------------ CNPJ --- */

/** Strips the mask: the database stores fourteen digits and nothing else. */
export function cnpjDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '')
}

/** `12.345.678/0001-90` for display; returns the input unchanged if incomplete. */
export function formatCNPJ(value: string | null | undefined): string {
  const d = cnpjDigits(value)
  if (d.length !== 14) return value ?? ''
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/** Masks as the user types, so the field reads naturally while being filled. */
export function maskCNPJ(value: string): string {
  const d = cnpjDigits(value).slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
