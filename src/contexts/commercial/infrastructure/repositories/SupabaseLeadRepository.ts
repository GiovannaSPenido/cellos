import LeadRepository, { LeadFilter } from '../../domain/repositories/LeadRepository'
import Lead from '../../domain/entities/Lead'
import Money from '@/shared/domain/value-objects/Money'
import { getSupabaseClient } from '@/lib/supabase'
import { formatDateOnly, parseDateOnly, parseTimestamp } from '@/lib/dates'

/**
 * Column names are Portuguese, matching the documented data model; translating
 * them to the English domain model is this layer's job.
 */
export interface LeadRow {
  id: string
  usuario_id: string
  nome: string
  empresa: string | null
  cargo: string | null
  email: string
  telefone: string
  tipo_pessoa: string
  status: string
  plano_interesse: string | null
  vidas: number
  valor_estimado: string | null
  origem: string | null
  proximo_contato: string | null
  observacoes: string | null
  quente: boolean
  versao: number
  criado_em: string
  atualizado_em: string
}

/** Code `.single()` returns when no row matches. */
const NO_ROWS = 'PGRST116'

export class SupabaseLeadRepository implements LeadRepository {
  private table() {
    return getSupabaseClient().from('leads')
  }

  async save(lead: Lead): Promise<Lead> {
    const { data, error } = await this.table().insert([this.toRow(lead)]).select().single()

    if (error) throw new Error(`Failed to save lead: ${error.message}`)

    return this.toDomain(data as LeadRow)
  }

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await this.table().select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead: ${error.message}`)
    }
    return data ? this.toDomain(data as LeadRow) : null
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const { data, error } = await this.table().select('*').eq('email', email).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead by e-mail: ${error.message}`)
    }
    return data ? this.toDomain(data as LeadRow) : null
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    const { data, error } = await this.table().select('*').eq('telefone', phone).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead by phone: ${error.message}`)
    }
    return data ? this.toDomain(data as LeadRow) : null
  }

  async findAll(filter: LeadFilter = {}): Promise<Lead[]> {
    let query = this.table().select('*')

    if (filter.userId) query = query.eq('usuario_id', filter.userId)
    if (filter.status) query = query.eq('status', filter.status)
    if (filter.search) {
      const term = `%${filter.search}%`
      query = query.or(`nome.ilike.${term},empresa.ilike.${term},email.ilike.${term}`)
    }

    const { data, error } = await query.order('criado_em', { ascending: false })

    if (error) throw new Error(`Failed to list leads: ${error.message}`)

    return (data as LeadRow[]).map((row) => this.toDomain(row))
  }

  async findDueForContact(until: Date, userId?: string): Promise<Lead[]> {
    let query = this.table()
      .select('*')
      .not('proximo_contato', 'is', null)
      .lte('proximo_contato', formatDateOnly(until) as string)
      .neq('status', 'CONVERTED')
      .neq('status', 'LOST')

    if (userId) query = query.eq('usuario_id', userId)

    const { data, error } = await query.order('proximo_contato', { ascending: true })

    if (error) throw new Error(`Failed to list leads due for contact: ${error.message}`)

    return (data as LeadRow[]).map((row) => this.toDomain(row))
  }

  async update(lead: Lead): Promise<Lead> {
    const row = this.toRow(lead)
    // The database owns these.
    delete (row as Partial<LeadRow>).id
    delete (row as Partial<LeadRow>).criado_em
    delete (row as Partial<LeadRow>).atualizado_em

    const { data, error } = await this.table()
      .update(row)
      .eq('id', lead.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update lead: ${error.message}`)

    return this.toDomain(data as LeadRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table().delete().eq('id', id)
    if (error) throw new Error(`Failed to delete lead: ${error.message}`)
  }

  private toRow(lead: Lead): LeadRow {
    const data = lead.toPrimitive()
    return {
      id: data.id,
      usuario_id: data.userId,
      nome: data.name,
      empresa: data.company,
      cargo: data.role,
      email: data.email,
      telefone: data.phone,
      tipo_pessoa: data.personType,
      status: data.status,
      plano_interesse: data.planOfInterest,
      vidas: data.lives,
      valor_estimado: lead.estimatedValue ? lead.estimatedValue.toDatabaseValue() : null,
      origem: data.origin,
      proximo_contato: formatDateOnly(data.nextContactAt),
      observacoes: data.notes,
      quente: data.hot,
      versao: data.version,
      criado_em: data.createdAt.toISOString(),
      atualizado_em: data.updatedAt.toISOString(),
    }
  }

  private toDomain(row: LeadRow): Lead {
    return new Lead({
      id: row.id,
      userId: row.usuario_id,
      name: row.nome,
      company: row.empresa,
      role: row.cargo,
      email: row.email,
      phone: row.telefone,
      personType: row.tipo_pessoa,
      status: row.status,
      planOfInterest: row.plano_interesse,
      lives: row.vidas,
      estimatedValue: row.valor_estimado ? Money.fromReais(row.valor_estimado) : null,
      origin: row.origem,
      nextContactAt: parseDateOnly(row.proximo_contato),
      notes: row.observacoes,
      hot: row.quente,
      version: row.versao,
      createdAt: parseTimestamp(row.criado_em) ?? undefined,
      updatedAt: parseTimestamp(row.atualizado_em) ?? undefined,
    })
  }
}

export default SupabaseLeadRepository
