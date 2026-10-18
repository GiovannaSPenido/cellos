import { toErrorResponse } from '@/lib/api'
import { getContainer } from '@/lib/container'

/**
 * RF08 — the plan catalogue. Public: the institutional site lists plans to
 * visitors, which `planos_select_publico` allows without a session.
 */
export async function GET() {
  try {
    const container = await getContainer()

    const plans = await container.repositories.plans.findAllActive()

    return Response.json({ plans: plans.map((plan) => plan.toPrimitive()) })
  } catch (error) {
    return toErrorResponse(error)
  }
}
