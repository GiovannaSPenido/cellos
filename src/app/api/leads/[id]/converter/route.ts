import type { NextRequest } from 'next/server'
import { parseDate, readJson, required, requireApiUser, toErrorResponse } from '@/lib/api'

interface Body {
  planId?: string
  monthlyFee?: number | string
  startsOn?: string
  renewsOn?: string | null
  lives?: number
  city?: string | null
}

/** RNG05 — turn a lead into a client, keeping its history attached. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/leads/[id]/converter'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()
    const body = await readJson<Body>(request)

    const client = await container.convertLeadToClient.execute({
      leadId: id,
      planId: required(body.planId, 'planId'),
      monthlyFee: required(body.monthlyFee, 'monthlyFee'),
      startsOn: parseDate(required(body.startsOn, 'startsOn'), 'startsOn'),
      renewsOn: body.renewsOn ? parseDate(body.renewsOn, 'renewsOn') : null,
      lives: body.lives,
      city: body.city ?? null,
    })

    return Response.json({ client }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
