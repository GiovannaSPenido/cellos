import type { NextRequest } from 'next/server'
import { readJson, required, requireApiUser, toErrorResponse } from '@/lib/api'
import type { LeadStatusValue } from '@/contexts/commercial/domain/value-objects/LeadStatus'

/** RF05 — move a lead between funnel stages, which is what the kanban does. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/leads/[id]/status'>) {
  try {
    const { id } = await ctx.params
    const { container } = await requireApiUser()
    const body = await readJson<{ status?: LeadStatusValue }>(request)

    const lead = await container.changeLeadStatus.execute(
      id,
      required(body.status, 'status'),
    )

    return Response.json({ lead })
  } catch (error) {
    return toErrorResponse(error)
  }
}
