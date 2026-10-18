import type { NextRequest } from 'next/server'
import { readJson, requireApiUser, toErrorResponse } from '@/lib/api'
import type { UpdateClientDTO } from '@/contexts/commercial/application/usecases/UpdateClientUseCase'
import NotFoundException from '@/shared/domain/exceptions/NotFoundException'

/** RF03 — one client, with the lead it came from and its history. */
export async function GET(_request: NextRequest, ctx: RouteContext<'/api/clientes/[id]'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()

    const client = await container.repositories.clients.findById(id)
    if (!client) {
      throw new NotFoundException('Client', id)
    }

    const [history, plan] = await Promise.all([
      container.getLeadHistory.execute(client.leadId),
      container.repositories.plans.findById(client.planId),
    ])

    return Response.json({
      client: client.toPrimitive(),
      lead: history.lead,
      interactions: history.interactions,
      plan: plan ? plan.toPrimitive() : null,
      daysUntilRenewal: client.daysUntilRenewal(),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}

/** RF04 — edit a client's contract. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/clientes/[id]'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()
    const body = await readJson<UpdateClientDTO & { renewsOn?: string | null }>(request)

    const client = await container.updateClient.execute(id, {
      ...body,
      renewsOn:
        body.renewsOn === undefined
          ? undefined
          : body.renewsOn === null
            ? null
            : new Date(body.renewsOn),
    })

    return Response.json({ client })
  } catch (error) {
    return toErrorResponse(error)
  }
}
