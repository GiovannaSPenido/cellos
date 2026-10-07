import ClientRepository, { ClientFilter } from '../../domain/repositories/ClientRepository'
import Client from '../../domain/entities/Client'
import Money from '@/shared/domain/value-objects/Money'
import { getSupabaseClient } from '@/lib/supabase'
import { formatDateOnly, parseDateOnly, parseTimestamp } from '@/lib/dates'

export interface ClientRow {
  id: string
  lead_id: string
  plano_id: string
  vidas: number
  mensalidade: string
  inicio_vigencia: string
  renovacao: string | null
  status: string
  cidade: string | null
  responsavel: string | null
  oportunidade: string | null
  versao: number
  criado_em: string
  atualizado_em: string
}

const NO_ROWS = 'PGRST116'

export class SupabaseClientRepository implements ClientRepository {
  private table() {
    return getSupabaseClient().from('clientes')
  }

  async save(client: Client): Promise<Client> {
    const { data, error } = await this.table().insert([this.toRow(client)]).select().single()

    if (error) throw new Error(`Failed to save client: ${error.message}`)

    return this.toDomain(data as ClientRow)
  }

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.table().select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find client: ${error.message}`)
    }
    return data ? this.toDomain(data as ClientRow) : null
  }

  async findByLeadId(leadId: string): Promise<Client | null> {
    const { data, error } = await this.table().select('*').eq('lead_id', leadId).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find client by lead: ${error.message}`)
    }
    return data ? this.toDomain(data as ClientRow) : null
  }

  async findAll(filter: ClientFilter = {}): Promise<Client[]> {
    let query = this.table().select('*')

    if (filter.status) query = query.eq('status', filter.status)
    if (filter.search) query = query.ilike('cidade', `%${filter.search}%`)

    const { data, error } = await query.order('criado_em', { ascending: false })

    if (error) throw new Error(`Failed to list clients: ${error.message}`)

    return (data as ClientRow[]).map((row) => this.toDomain(row))
  }

  async findRenewingUntil(until: Date): Promise<Client[]> {
    const { data, error } = await this.table()
      .select('*')
      .not('renovacao', 'is', null)
      .lte('renovacao', formatDateOnly(until) as string)
      .neq('status', 'CANCELLED')
      .order('renovacao', { ascending: true })

    if (error) throw new Error(`Failed to list renewals: ${error.message}`)

    return (data as ClientRow[]).map((row) => this.toDomain(row))
  }

  async update(client: Client): Promise<Client> {
    const row = this.toRow(client)
    delete (row as Partial<ClientRow>).id
    delete (row as Partial<ClientRow>).lead_id
    delete (row as Partial<ClientRow>).criado_em
    delete (row as Partial<ClientRow>).atualizado_em

    const { data, error } = await this.table()
      .update(row)
      .eq('id', client.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update client: ${error.message}`)

    return this.toDomain(data as ClientRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table().delete().eq('id', id)
    if (error) throw new Error(`Failed to delete client: ${error.message}`)
  }

  private toRow(client: Client): ClientRow {
    const data = client.toPrimitive()
    return {
      id: data.id,
      lead_id: data.leadId,
      plano_id: data.planId,
      vidas: data.lives,
      mensalidade: client.monthlyFee.toDatabaseValue(),
      inicio_vigencia: formatDateOnly(data.startsOn) as string,
      renovacao: formatDateOnly(data.renewsOn),
      status: data.status,
      cidade: data.city,
      responsavel: data.contactPerson,
      oportunidade: data.opportunity,
      versao: data.version,
      criado_em: data.createdAt.toISOString(),
      atualizado_em: data.updatedAt.toISOString(),
    }
  }

  private toDomain(row: ClientRow): Client {
    return new Client({
      id: row.id,
      leadId: row.lead_id,
      planId: row.plano_id,
      lives: row.vidas,
      monthlyFee: Money.fromReais(row.mensalidade),
      startsOn: parseDateOnly(row.inicio_vigencia) as Date,
      renewsOn: parseDateOnly(row.renovacao),
      status: row.status,
      city: row.cidade,
      contactPerson: row.responsavel,
      opportunity: row.oportunidade,
      version: row.versao,
      createdAt: parseTimestamp(row.criado_em) ?? undefined,
      updatedAt: parseTimestamp(row.atualizado_em) ?? undefined,
    })
  }
}

export default SupabaseClientRepository
