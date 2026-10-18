import { requireApiUser, toErrorResponse } from '@/lib/api'

/** RNG07 — renewals coming due and clients who could move up a tier. */
export async function GET() {
  try {
    const { container } = await requireApiUser()

    const opportunities = await container.identifyOpportunities.execute()

    return Response.json({ opportunities })
  } catch (error) {
    return toErrorResponse(error)
  }
}
