import type { NextRequest } from 'next/server'
import { requireApiUser, toErrorResponse } from '@/lib/api'
import type { ClientStatusValue } from '@/contexts/commercial/domain/value-objects/ClientStatus'
import type { PersonTypeValue } from '@/contexts/commercial/domain/value-objects/PersonType'

/** RF03 — list active clients. */
export async function GET(request: NextRequest) {
  try {
    const { container } = await requireApiUser()
    const params = request.nextUrl.searchParams

    const clients = await container.listClients.execute({
      status: (params.get('status') as ClientStatusValue | null) ?? undefined,
      personType: (params.get('tipo') as PersonTypeValue | null) ?? undefined,
      search: params.get('busca') ?? undefined,
    })

    return Response.json({ clients })
  } catch (error) {
    return toErrorResponse(error)
  }
}
