import DomainException from '@/shared/domain/exceptions/DomainException'
import NotFoundException from '@/shared/domain/exceptions/NotFoundException'
import User from '@/contexts/commercial/domain/entities/User'
import { buildContainer, type Container } from './container'
import { createServerSupabaseClient } from './supabase/server'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiContext {
  user: User
  container: Container
}

/**
 * Resolves the caller for a route behind the management module (RNF01). Throws
 * an ApiError the handler's catch turns into a response.
 */
export async function requireApiUser(): Promise<ApiContext> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    throw new ApiError('É necessário entrar para acessar este recurso.', 401)
  }

  const container = buildContainer(supabase)
  const user = await container.repositories.users.findById(authUser.id)

  if (!user) {
    throw new ApiError('Usuário sem cadastro no sistema.', 403)
  }
  if (!user.active) {
    throw new ApiError('Seu acesso está desativado.', 403)
  }

  return { user, container }
}

/** Single place that decides the status code for every failure a route can hit. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  if (error instanceof NotFoundException) {
    return Response.json({ error: error.message }, { status: 404 })
  }
  if (error instanceof DomainException) {
    // A business rule refused the request: the input was understood and rejected.
    return Response.json({ error: error.message }, { status: 422 })
  }
  if (error instanceof SyntaxError) {
    return Response.json({ error: 'Corpo da requisição não é um JSON válido.' }, { status: 400 })
  }

  console.error('[api] unhandled', error)
  return Response.json({ error: 'Erro interno do servidor.' }, { status: 500 })
}

/** Reads a JSON body, failing with 400 rather than throwing a bare SyntaxError. */
export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new ApiError('Corpo da requisição não é um JSON válido.', 400)
  }
}

/** Requires a field to be present and non-empty. */
export function required<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(`O campo "${field}" é obrigatório.`, 400)
  }
  return value
}

/** Parses an ISO date, rejecting anything unparseable. */
export function parseDate(value: unknown, field: string): Date {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(`O campo "${field}" não é uma data válida.`, 400)
  }
  return date
}
