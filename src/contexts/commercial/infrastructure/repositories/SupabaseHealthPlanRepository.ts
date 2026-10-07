import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import HealthPlan from '../../domain/entities/HealthPlan'
import Money from '@/shared/domain/value-objects/Money'
import { getSupabaseClient } from '@/lib/supabase'
import { parseTimestamp } from '@/lib/dates'

export interface HealthPlanRow {
  id: string
  codigo: string
  nome: string
  operadora: string
  tier: string
  tipo_cobertura: string
  abrangencia: string
  acomodacao: string
  coparticipacao: boolean
  reembolso: boolean
  rede_credenciada: string | null
  carencia: string | null
  preco_base: string
  resumo: string | null
  destaque: boolean
  inclui: string[]
  nao_inclui: string[]
  ativo: boolean
  criado_em: string
}

const NO_ROWS = 'PGRST116'

export class SupabaseHealthPlanRepository implements HealthPlanRepository {
  private table() {
    return getSupabaseClient().from('planos_saude')
  }

  async findById(id: string): Promise<HealthPlan | null> {
    const { data, error } = await this.table().select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find health plan: ${error.message}`)
    }
    return data ? this.toDomain(data as HealthPlanRow) : null
  }

  async findByCode(code: string): Promise<HealthPlan | null> {
    const { data, error } = await this.table().select('*').eq('codigo', code).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find health plan by code: ${error.message}`)
    }
    return data ? this.toDomain(data as HealthPlanRow) : null
  }

  async findAllActive(): Promise<HealthPlan[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('ativo', true)
      .order('preco_base', { ascending: true })

    if (error) throw new Error(`Failed to list health plans: ${error.message}`)

    return (data as HealthPlanRow[]).map((row) => this.toDomain(row))
  }

  async findAll(): Promise<HealthPlan[]> {
    const { data, error } = await this.table()
      .select('*')
      .order('preco_base', { ascending: true })

    if (error) throw new Error(`Failed to list health plans: ${error.message}`)

    return (data as HealthPlanRow[]).map((row) => this.toDomain(row))
  }

  async save(plan: HealthPlan): Promise<HealthPlan> {
    const { data, error } = await this.table().insert([this.toRow(plan)]).select().single()

    if (error) throw new Error(`Failed to save health plan: ${error.message}`)

    return this.toDomain(data as HealthPlanRow)
  }

  async update(plan: HealthPlan): Promise<HealthPlan> {
    const row = this.toRow(plan)
    delete (row as Partial<HealthPlanRow>).id
    delete (row as Partial<HealthPlanRow>).criado_em

    const { data, error } = await this.table()
      .update(row)
      .eq('id', plan.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update health plan: ${error.message}`)

    return this.toDomain(data as HealthPlanRow)
  }

  private toRow(plan: HealthPlan): HealthPlanRow {
    const data = plan.toPrimitive()
    return {
      id: data.id,
      codigo: data.code,
      nome: data.name,
      operadora: data.carrier,
      tier: data.tier,
      tipo_cobertura: data.coverageType,
      abrangencia: data.coverageArea,
      acomodacao: data.accommodation,
      coparticipacao: data.hasCoPayment,
      reembolso: data.hasReimbursement,
      rede_credenciada: data.network,
      carencia: data.waitingPeriod,
      preco_base: plan.basePrice.toDatabaseValue(),
      resumo: data.summary,
      destaque: data.featured,
      inclui: data.includes,
      nao_inclui: data.excludes,
      ativo: data.active,
      criado_em: data.createdAt.toISOString(),
    }
  }

  private toDomain(row: HealthPlanRow): HealthPlan {
    return new HealthPlan({
      id: row.id,
      code: row.codigo,
      name: row.nome,
      carrier: row.operadora,
      tier: row.tier,
      coverageType: row.tipo_cobertura,
      coverageArea: row.abrangencia,
      accommodation: row.acomodacao,
      hasCoPayment: row.coparticipacao,
      hasReimbursement: row.reembolso,
      network: row.rede_credenciada,
      waitingPeriod: row.carencia,
      basePrice: Money.fromReais(row.preco_base),
      summary: row.resumo,
      featured: row.destaque,
      includes: row.inclui ?? [],
      excludes: row.nao_inclui ?? [],
      active: row.ativo,
      createdAt: parseTimestamp(row.criado_em) ?? undefined,
    })
  }
}

export default SupabaseHealthPlanRepository
