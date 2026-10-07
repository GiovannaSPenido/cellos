import UserRepository from '../../domain/repositories/UserRepository'
import User from '../../domain/entities/User'
import { getSupabaseClient } from '@/lib/supabase'
import { parseTimestamp } from '@/lib/dates'

export interface UserRow {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

const NO_ROWS = 'PGRST116'

export class SupabaseUserRepository implements UserRepository {
  private table() {
    return getSupabaseClient().from('usuarios')
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.table().select('*').eq('id', id).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find user: ${error.message}`)
    }
    return data ? this.toDomain(data as UserRow) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.table().select('*').eq('email', email).single()

    if (error && error.code !== NO_ROWS) {
      throw new Error(`Failed to find user by e-mail: ${error.message}`)
    }
    return data ? this.toDomain(data as UserRow) : null
  }

  async findAllActive(): Promise<User[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) throw new Error(`Failed to list users: ${error.message}`)

    return (data as UserRow[]).map((row) => this.toDomain(row))
  }

  /**
   * RNG08 — a lead captured on the website needs an owner before it can be
   * stored, since `leads.usuario_id` is mandatory.
   */
  async findDefaultSalesperson(): Promise<User | null> {
    const { data, error } = await this.table()
      .select('*')
      .eq('ativo', true)
      .eq('perfil', 'SALES')
      .order('criado_em', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(`Failed to find a default salesperson: ${error.message}`)

    return data ? this.toDomain(data as UserRow) : null
  }

  async save(user: User): Promise<User> {
    const { data, error } = await this.table().insert([this.toRow(user)]).select().single()

    if (error) throw new Error(`Failed to save user: ${error.message}`)

    return this.toDomain(data as UserRow)
  }

  async update(user: User): Promise<User> {
    const row = this.toRow(user)
    delete (row as Partial<UserRow>).id
    delete (row as Partial<UserRow>).criado_em
    delete (row as Partial<UserRow>).atualizado_em

    const { data, error } = await this.table()
      .update(row)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)

    return this.toDomain(data as UserRow)
  }

  private toRow(user: User): UserRow {
    const data = user.toPrimitive()
    return {
      id: data.id,
      nome: data.name,
      email: data.email,
      perfil: data.profile,
      ativo: data.active,
      criado_em: data.createdAt.toISOString(),
      atualizado_em: data.updatedAt.toISOString(),
    }
  }

  private toDomain(row: UserRow): User {
    return new User({
      id: row.id,
      name: row.nome,
      email: row.email,
      profile: row.perfil,
      active: row.ativo,
      createdAt: parseTimestamp(row.criado_em) ?? undefined,
      updatedAt: parseTimestamp(row.atualizado_em) ?? undefined,
    })
  }
}

export default SupabaseUserRepository
