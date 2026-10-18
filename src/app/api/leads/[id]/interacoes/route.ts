import type { NextRequest } from 'next/server'
import { readJson, required, requireApiUser, toErrorResponse } from '@/lib/api'
import type { InteractionTypeValue } from '@/contexts/commercial/domain/value-objects/InteractionType'

interface Body {
  type?: InteractionTypeValue
  description?: string
  occurredAt?: string
  nextContactAt?: string | null
}

/** RF10 — the contact history of a lead. */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/leads/[id]/interacoes'>,
) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()

    // Goes through the use case so a lead the caller cannot see answers 404.
    const { interactions } = await container.getLeadHistory.execute(id)

    return Response.json({ interactions })
  } catch (error) {
    return toErrorResponse(error)
  }
}

/** RF02 — record a contact with a lead. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/leads/[id]/interacoes'>) {
  try {
    const { id } = await ctx.params
    const { user, container } = await requireApiUser()
    const body = await readJson<Body>(request)

    const interaction = await container.registerInteraction.execute({
      leadId: id,
      userId: user.id,
      type: required(body.type, 'type'),
      description: required(body.description, 'description'),
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
      nextContactAt:
        body.nextContactAt === undefined
          ? undefined
          : body.nextContactAt === null
            ? null
            : new Date(body.nextContactAt),
    })

    return Response.json({ interaction }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
