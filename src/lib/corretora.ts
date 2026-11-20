/**
 * Dados institucionais da Cellos, conforme o formulário devolvido pela
 * corretora em novembro de 2026.
 *
 * O que ainda não foi informado está marcado com `pending: true` e aparece no
 * site com a etiqueta "a confirmar" — é preferível admitir a lacuna a publicar
 * um número que a empresa não sustente.
 */

import type { PlanKind, PlanAudience } from '@/contexts/commercial/domain/entities/HealthPlan'

export interface Operadora {
  slug: string
  name: string
  /** Médico ou odontológico — a mesma divisão da coluna `modalidade`. */
  kind: PlanKind
  /** Para quem a operadora atende, igual à coluna `contratacao`. */
  audience: PlanAudience
  summary: string
  highlights: string[]
  pending?: boolean
}

/** Operadoras com que a corretora trabalha hoje (aba "Empresa e parceiros"). */
export const CARRIERS: Operadora[] = [
  {
    slug: 'unimed',
    name: 'Unimed',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'Planos médicos para pessoa física e para empresa em Minas Gerais, com a '
      + 'rede de cooperativas médicas de maior alcance no país.',
    highlights: ['Pessoa física e empresarial', 'Minas Gerais'],
  },
  {
    slug: 'hapvida',
    name: 'Hapvida',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'Planos médicos para pessoa física e para empresa em Minas Gerais, com '
      + 'rede própria de hospitais, clínicas e laboratórios.',
    highlights: ['Pessoa física e empresarial', 'Rede própria'],
  },
  {
    slug: 'aurora',
    name: 'Aurora',
    kind: 'MEDICAL',
    audience: 'CORPORATE',
    summary:
      'Planos médicos empresariais em Minas Gerais, com condições negociadas '
      + 'por volume de vidas.',
    highlights: ['Somente empresarial', 'Minas Gerais'],
  },
  {
    slug: 'amil',
    name: 'Amil',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'Planos médicos para pessoa física e para empresa em Minas Gerais.',
    highlights: ['Pessoa física e empresarial', 'Minas Gerais'],
  },
]

/** Números institucionais exibidos na página Sobre. */
export const COMPANY_STATS: { value: string; label: string; pending?: boolean }[] = [
  { value: '20+', label: 'anos de experiência no segmento', pending: true },
  { value: '+10 mil', label: 'clientes atendidos' },
  { value: 'PF e PJ', label: 'pessoas físicas e empresas' },
]

/** Frase enviada pela corretora para abrir a página institucional. */
export const COMPANY_TAGLINE = 'Cuidado que vai além do plano.'

/** Referências comerciais — as operadoras representadas. */
export const REFERENCES: { name: string; role: string; pending?: boolean }[] =
  CARRIERS.map((c) => ({ name: c.name, role: 'Operadora parceira' }))

/**
 * Canais de atendimento. A corretora informou que não possui telefone fixo,
 * então o site não anuncia nenhum: WhatsApp e e-mail são os canais reais.
 */
export const CONTACT_CHANNELS = [
  {
    kind: 'whatsapp' as const,
    label: 'WhatsApp',
    value: '(31) 98448-3216',
    hint: 'Segunda a sexta, 8h às 18h',
  },
  {
    kind: 'email' as const,
    label: 'E-mail',
    value: 'cellos.planos@gmail.com',
    hint: 'Retorno em até 1 dia útil',
  },
]

export const OPENING_HOURS = 'Segunda a sexta, 8h às 18h'
