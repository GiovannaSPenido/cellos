import ClientRepository, { ClientFilter } from '../../domain/repositories/ClientRepository'
import LeadRepository from '../../domain/repositories/LeadRepository'
import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import { ClientStatusValue } from '../../domain/value-objects/ClientStatus'
import { PersonTypeValue } from '../../domain/value-objects/PersonType'

/**
 * A client row as the listing shows it. The client record holds only foreign
 * keys, so the name and plan are resolved here rather than in the component.
 */
export interface ClientListItem {
  id: string
  leadId: string
  name: string
  personType: PersonTypeValue
  planName: string
  lives: number
  monthlyFee: number
  status: ClientStatusValue
  renewsOn: Date | null
  daysUntilRenewal: number | null
  city: string | null
  opportunity: string | null
}

export interface ListClientsOptions extends ClientFilter {
  personType?: PersonTypeValue
}

/** RF03 — list active clients. */
export class ListClientsUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly leadRepository: LeadRepository,
    private readonly healthPlanRepository: HealthPlanRepository,
  ) {}

  async execute(options: ListClientsOptions = {}): Promise<ClientListItem[]> {
    const { personType, ...filter } = options

    const [clients, plans] = await Promise.all([
      this.clientRepository.findAll(filter),
      this.healthPlanRepository.findAll(),
    ])

    const planNames = new Map(plans.map((plan) => [plan.id, plan.name]))

    const leads = await Promise.all(
      clients.map((client) => this.leadRepository.findById(client.leadId)),
    )

    const today = new Date()
    const items: ClientListItem[] = []

    clients.forEach((client, index) => {
      const lead = leads[index]
      if (!lead) {
        return
      }
      if (personType && lead.personType.value !== personType) {
        return
      }

      items.push({
        id: client.id,
        leadId: client.leadId,
        name: lead.displayName,
        personType: lead.personType.value,
        planName: planNames.get(client.planId) ?? '—',
        lives: client.lives,
        monthlyFee: client.monthlyFee.toPrimitive(),
        status: client.status.value,
        renewsOn: client.renewsOn,
        daysUntilRenewal: client.daysUntilRenewal(today),
        city: client.city,
        opportunity: client.opportunity,
      })
    })

    if (options.search) {
      const term = options.search.toLowerCase()
      return items.filter((item) => item.name.toLowerCase().includes(term))
    }

    return items
  }
}

export default ListClientsUseCase
