import type { NextRequest } from 'next/server'
import { parseDate, readJson, requireApiUser, toErrorResponse } from '@/lib/api'
import type { UpdateLeadDTO } from '@/contexts/commercial/application/usecases/UpdateLeadUseCase'
import NotFoundException from '@/shared/domain/exceptions/NotFoundException'
import { cnpjDigits } from '@/lib/format'

/** RF03 and RF10 — a lead with its interaction history. */
export async function GET(_request: NextRequest, ctx: RouteContext<'/api/leads/[id]'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()

    const history = await container.getLeadHistory.execute(id)

    return Response.json(history)
  } catch (error) {
    return toErrorResponse(error)
  }
}

/** RF04 — edit a lead. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/leads/[id]'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()
    const body = await readJson<UpdateLeadDTO & { nextContactAt?: string | null }>(request)

    const lead = await container.updateLead.execute(id, {
      ...body,
      cnpj: body.cnpj === undefined ? undefined : cnpjDigits(body.cnpj ?? '') || null,
      nextContactAt:
        body.nextContactAt === undefined
          ? undefined
          : body.nextContactAt === null
            ? null
            : parseDate(body.nextContactAt, 'nextContactAt'),
    })

    return Response.json({ lead })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/leads/[id]'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()

    const lead = await container.repositories.leads.findById(id)
    if (!lead) {
      throw new NotFoundException('Lead', id)
    }

    await container.repositories.leads.delete(id)

    return new Response(null, { status: 204 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
