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
