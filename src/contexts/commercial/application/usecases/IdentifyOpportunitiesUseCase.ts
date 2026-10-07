import ClientRepository from '../../domain/repositories/ClientRepository'
import LeadRepository from '../../domain/repositories/LeadRepository'
import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import { RENEWAL_WINDOW_DAYS } from '../../domain/entities/Client'

export type OpportunityKind = 'RENEWAL' | 'UPGRADE' | 'OVERDUE_RENEWAL'

export interface Opportunity {
  kind: OpportunityKind
  clientId: string
  leadId: string
  name: string
  planName: string
  monthlyFee: number
  renewsOn: Date | null
  daysUntilRenewal: number | null
  /** What the salesperson should do about it. */
  description: string
}

/**
 * RNG07 — surface commercial opportunities: renewals coming due and clients on
 * an entry plan who could move up.
 */
export class IdentifyOpportunitiesUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly leadRepository: LeadRepository,
    private readonly healthPlanRepository: HealthPlanRepository,
  ) {}

  async execute(
    reference: Date = new Date(),
    windowDays: number = RENEWAL_WINDOW_DAYS,
  ): Promise<Opportunity[]> {
    const horizon = new Date(reference)
    horizon.setDate(horizon.getDate() + windowDays)

    const [clients, plans] = await Promise.all([
      this.clientRepository.findRenewingUntil(horizon),
      this.healthPlanRepository.findAll(),
    ])

    const planById = new Map(plans.map((plan) => [plan.id, plan]))
    const topLevel = Math.max(...plans.map((plan) => plan.level), 1)

    const leads = await Promise.all(
      clients.map((client) => this.leadRepository.findById(client.leadId)),
    )

    const opportunities: Opportunity[] = []

    clients.forEach((client, index) => {
      const lead = leads[index]
      const plan = planById.get(client.planId)
      if (!lead || !plan) {
        return
      }

      const days = client.daysUntilRenewal(reference)
      const base = {
        clientId: client.id,
        leadId: client.leadId,
        name: lead.displayName,
        planName: plan.name,
        monthlyFee: client.monthlyFee.toPrimitive(),
        renewsOn: client.renewsOn,
        daysUntilRenewal: days,
      }

      if (days !== null && days < 0) {
        opportunities.push({
          ...base,
          kind: 'OVERDUE_RENEWAL',
          description: `Renovação vencida há ${Math.abs(days)} dias — contato urgente.`,
        })
      } else if (days !== null) {
        opportunities.push({
          ...base,
          kind: 'RENEWAL',
          description: `Renovação em ${days} dias — confirmar contrato e reajuste.`,
        })
      }

      // A client below the top tier is a candidate to move up at renewal.
      if (plan.level < topLevel) {
        opportunities.push({
          ...base,
          kind: 'UPGRADE',
          description: `Hoje no ${plan.name} (${plan.tier}) — avaliar upgrade na renovação.`,
        })
      }
    })

    // Most urgent first; an opportunity with no renewal date sits at the end.
    return opportunities.sort((a, b) => {
      const left = a.daysUntilRenewal ?? Number.MAX_SAFE_INTEGER
      const right = b.daysUntilRenewal ?? Number.MAX_SAFE_INTEGER
      return left - right
    })
  }
}

export default IdentifyOpportunitiesUseCase
