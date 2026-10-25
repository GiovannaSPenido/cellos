import { getContainer } from './container'
import type { HealthPlanPrimitive } from '@/contexts/commercial/domain/entities/HealthPlan'

/**
 * The plan catalogue for the public site.
 *
 * Returns an empty list instead of throwing when the database is unreachable:
 * a marketing page that loses its price table is still worth serving, and a
 * free-tier project pauses after a week idle. The management module behaves the
 * opposite way on purpose — there, stale or missing data must be visible.
 */
export async function loadCatalogue(): Promise<{
  plans: HealthPlanPrimitive[]
  unavailable: boolean
}> {
  try {
    const container = await getContainer()
    const plans = await container.repositories.plans.findAllActive()
    return { plans: plans.map((plan) => plan.toPrimitive()), unavailable: false }
  } catch (error) {
    console.error('[catalogue] unavailable', error)
    return { plans: [], unavailable: true }
  }
}
