/**
 * ⚠️ DADOS PROVISÓRIOS — substituir pelos reais da Cellos.
 *
 * Tudo aqui saiu da reunião de validação de 08/11/2026 e é aproximado de
 * propósito: a corretora ainda vai devolver o formulário com as operadoras
 * parceiras, os números da empresa e os contatos verdadeiros. Enquanto isso,
 * as páginas existem e o fluxo pode ser avaliado.
 *
 * Para substituir: troque os valores deste arquivo. Nenhuma página precisa
 * mudar. Os itens marcados `pending: true` aparecem no site com a etiqueta
 * "a confirmar", então removê-la é só apagar a marcação.
 */

import type { PlanKind, PlanAudience } from '@/contexts/commercial/domain/entities/HealthPlan'

export interface CarrierPlaceholder {
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

export const CARRIERS: CarrierPlaceholder[] = [
  {
    slug: 'unimed',
    name: 'Unimed',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'A maior rede de cooperativas médicas do país. Atendimento em praticamente todo o território nacional e forte presença em Minas Gerais.',
    highlights: ['Rede nacional', 'Cooperativa médica', 'Planos individuais e empresariais'],
  },
  {
    slug: 'hapvida',
    name: 'Hapvida',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'Opera com rede própria de hospitais, clínicas e laboratórios, o que costuma deixar a mensalidade mais acessível.',
    highlights: ['Rede própria', 'Mensalidade acessível', 'Pronto-atendimento 24h'],
  },
  {
    slug: 'sulamerica',
    name: 'SulAmérica',
    kind: 'MEDICAL',
    audience: 'BOTH',
    summary:
      'Mais de setenta anos de mercado, conhecida pela amplitude da rede credenciada e pelo reembolso em consultas fora da rede.',
    highlights: ['Reembolso', 'Rede ampla', 'Cobertura obstétrica'],
  },
  {
    slug: 'operadora-pj',
    name: 'Linha empresarial',
    kind: 'MEDICAL',
    audience: 'CORPORATE',
    summary:
      'Condições negociadas por volume de vidas, com gestão de inclusões e exclusões pela corretora.',
    highlights: ['A partir de 2 vidas', 'Gestão pela corretora'],
    pending: true,
  },
  {
    slug: 'odonto-pf',
    name: 'Odontológico individual',
    kind: 'DENTAL',
    audience: 'INDIVIDUAL',
    summary:
      'Limpeza, restauração, extração e urgência odontológica, com carência curta e mensalidade baixa.',
    highlights: ['Urgência 24h', 'Carência curta', 'Sem coparticipação'],
    pending: true,
  },
  {
    slug: 'odonto-pj',
    name: 'Odontológico empresarial',
    kind: 'DENTAL',
    audience: 'CORPORATE',
    summary:
      'Benefício odontológico para equipes, usado com frequência como complemento ao plano médico.',
    highlights: ['Complemento ao plano médico', 'Adesão por folha de pagamento'],
    pending: true,
  },
]

/** Números institucionais da página Sobre. */
export const COMPANY_STATS: { value: string; label: string; pending?: boolean }[] = [
  { value: '20+', label: 'anos de experiência no segmento', pending: true },
  { value: 'milhares', label: 'de clientes atendidos', pending: true },
  { value: 'PF e PJ', label: 'pessoas físicas e empresas' },
]

/** Referências comerciais — operadoras e parceiros com quem a corretora trabalha. */
export const REFERENCES: { name: string; role: string; pending?: boolean }[] = [
  { name: 'Unimed', role: 'Operadora parceira' },
  { name: 'Hapvida', role: 'Operadora parceira' },
  { name: 'SulAmérica', role: 'Operadora parceira' },
  { name: 'Demais parceiros', role: 'Aguardando a lista da corretora', pending: true },
]
