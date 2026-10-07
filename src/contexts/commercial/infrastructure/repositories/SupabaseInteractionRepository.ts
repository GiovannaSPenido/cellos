import InteractionRepository from '../../domain/repositories/InteractionRepository'
import Interaction from '../../domain/entities/Interaction'
import { getSupabaseClient } from '@/lib/supabase'
import { parseTimestamp } from '@/lib/dates'

export interface InteractionRow {
  id: string
  lead_id: string
  usuario_id: string
  data: string
  tipo: string
  descricao: string
  criado_em: string
}

const NO_ROWS = 'PGRST116'

export class SupabaseInteractionRepository implements InteractionRepository {
  private table() {
    return getSupabaseClient().from('interacoes')
  }

  async save(interaction: Interaction): Promise<Interaction> {
    const { data, error } = await this.table()
      .insert([this.toRow(interaction)])
      .select()
      .single()

    if (error) throw new Error(`Failed to save interaction: ${error.message}`)

    return this.toDomain(data as InteractionRow)
  }

  async findById(id: string): Promise<Interaction | null> {
    const { data, error } = await this.table().select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find interaction: ${error.message}`)
    }
    return data ? this.toDomain(data as InteractionRow) : null
  }

  async findByLeadId(leadId: string): Promise<Interaction[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('lead_id', leadId)
      .order('data', { ascending: false })

    if (error) throw new Error(`Failed to list interactions: ${error.message}`)

    return (data as InteractionRow[]).map((row) => this.toDomain(row))
  }

  async findRecent(limit: number, userId?: string): Promise<Interaction[]> {
    let query = this.table().select('*')
    if (userId) query = query.eq('usuario_id', userId)

    const { data, error } = await query.order('data', { ascending: false }).limit(limit)

    if (error) throw new Error(`Failed to list recent interactions: ${error.message}`)

    return (data as InteractionRow[]).map((row) => this.toDomain(row))
  }

  async countByLeadId(leadId: string): Promise<number> {
    const { count, error } = await this.table()
      .select('*', { count: 'exact', head: true })
      .eq('lead_id', leadId)

    if (error) throw new Error(`Failed to count interactions: ${error.message}`)

    return count ?? 0
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table().delete().eq('id', id)
    if (error) throw new Error(`Failed to delete interaction: ${error.message}`)
  }

  private toRow(interaction: Interaction): InteractionRow {
    const data = interaction.toPrimitive()
    return {
      id: data.id,
      lead_id: data.leadId,
      usuario_id: data.userId,
      data: data.occurredAt.toISOString(),
      tipo: data.type,
      descricao: data.description,
      criado_em: data.createdAt.toISOString(),
    }
  }

  private toDomain(row: InteractionRow): Interaction {
    return new Interaction({
      id: row.id,
      leadId: row.lead_id,
      userId: row.usuario_id,
      type: row.tipo,
      description: row.descricao,
      occurredAt: parseTimestamp(row.data) ?? new Date(),
      createdAt: parseTimestamp(row.criado_em) ?? undefined,
    })
  }
}

export default SupabaseInteractionRepository
