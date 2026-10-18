import type { NextRequest } from 'next/server'
import { readJson, required, requireApiUser, toErrorResponse } from '@/lib/api'
import type { CreateLeadDTO } from '@/contexts/commercial/application/dtos/CreateLeadDTO'
import type { LeadStatusValue } from '@/contexts/commercial/domain/value-objects/LeadStatus'

/** RF03 — list the leads the caller may see. */
export async function GET(request: NextRequest) {
  try {
    const { user, container } = await requireApiUser()
    const params = request.nextUrl.searchParams

    const leads = await container.listLeads.execute({
      // An administrator sees every lead; a salesperson only their own.
      userId: user.isAdmin() ? (params.get('usuarioId') ?? undefined) : user.id,
      status: (params.get('status') as LeadStatusValue | null) ?? undefined,
      search: params.get('busca') ?? undefined,
    })

    return Response.json({ leads })
  } catch (error) {
    return toErrorResponse(error)
  }
}

/** RF01 — register a lead. */
export async function POST(request: NextRequest) {
  try {
    const { user, container } = await requireApiUser()
    const body = await readJson<Partial<CreateLeadDTO>>(request)

    const lead = await container.createLead.execute({
      // The lead belongs to whoever is signed in, never to a value from the body.
      userId: user.id,
      name: required(body.name, 'name'),
      email: required(body.email, 'email'),
      phone: required(body.phone, 'phone'),
      personType: required(body.personType, 'personType'),
      company: body.company ?? null,
      role: body.role ?? null,
      planOfInterest: body.planOfInterest ?? null,
      lives: body.lives,
      estimatedValue: body.estimatedValue ?? null,
      origin: body.origin ?? 'Prospecção ativa',
      notes: body.notes ?? null,
    })

    return Response.json({ lead }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
