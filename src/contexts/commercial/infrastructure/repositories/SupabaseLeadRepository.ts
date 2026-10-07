import LeadRepository from '../../domain/repositories/LeadRepository'
import Lead from '../../domain/entities/Lead'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * Shape of a row in the `leads` table. Column names are Portuguese, matching
 * the documented MER (section 8.4); translating them to the English domain
 * model is this layer's job.
 *
 * NOTE: `usuario_id` and `tipo_pessoa` are NOT NULL in the database but are not
 * yet on the `Lead` aggregate — inserts fail until phase 2 adds them (task p2a).
 */
interface LeadRow {
  id: string
  usuario_id: string
  nome: string
  empresa: string | null
  cargo: string | null
  email: string
  telefone: string
  tipo_pessoa: 'PF' | 'PJ'
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

/** Postgres code returned by `.single()` when no row matches. */
const NO_ROWS = 'PGRST116'

export class SupabaseLeadRepository implements LeadRepository {
  private get table() {
    return getSupabaseClient().from('leads')
  }

  async save(lead: Lead): Promise<Lead> {
    const data = lead.toPrimitive()

    const { data: rows, error } = await this.table
      .insert([
        {
          id: data.id,
          nome: data.name,
          email: data.email,
          telefone: data.phone,
          status: data.status,
          plano_interesse: data.healthPlan,
          criado_em: data.createdAt,
          atualizado_em: data.updatedAt,
          versao: data.version,
        },
      ])
      .select()

    if (error) throw new Error(`Failed to save lead: ${error.message}`)

    return this.toDomain(rows[0] as LeadRow)
  }

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await this.table.select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead: ${error.message}`)
    }

    return data ? this.toDomain(data as LeadRow) : null
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const { data, error } = await this.table.select('*').eq('email', email).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead: ${error.message}`)
    }

    return data ? this.toDomain(data as LeadRow) : null
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    const { data, error } = await this.table.select('*').eq('telefone', phone).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find lead: ${error.message}`)
    }

    return data ? this.toDomain(data as LeadRow) : null
  }

  async findAll(): Promise<Lead[]> {
    const { data, error } = await this.table
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) throw new Error(`Failed to list leads: ${error.message}`)

    return (data as LeadRow[]).map((row) => this.toDomain(row))
  }

  async update(lead: Lead): Promise<Lead> {
    const data = lead.toPrimitive()

    const { data: rows, error } = await this.table
      .update({
        nome: data.name,
        email: data.email,
        telefone: data.phone,
        status: data.status,
        plano_interesse: data.healthPlan,
        versao: data.version,
      })
      .eq('id', data.id)
      .select()

    if (error) throw new Error(`Failed to update lead: ${error.message}`)

    return this.toDomain(rows[0] as LeadRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id)

    if (error) throw new Error(`Failed to delete lead: ${error.message}`)
  }

  private toDomain(row: LeadRow): Lead {
    return new Lead(row.id, row.nome, row.email, row.telefone, row.status, row.plano_interesse)
  }
}

export default SupabaseLeadRepository
