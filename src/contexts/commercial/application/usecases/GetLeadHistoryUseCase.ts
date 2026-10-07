import { LeadPrimitive } from '../../domain/entities/Lead'
import { InteractionPrimitive } from '../../domain/entities/Interaction'
import LeadRepository from '../../domain/repositories/LeadRepository'
import InteractionRepository from '../../domain/repositories/InteractionRepository'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface LeadHistory {
  lead: LeadPrimitive
  interactions: InteractionPrimitive[]
}

/** RF10 — a lead with its full contact history, for the detail drawer. */
export class GetLeadHistoryUseCase {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly interactionRepository: InteractionRepository,
  ) {}

  async execute(leadId: string): Promise<LeadHistory> {
    const lead = await this.leadRepository.findById(leadId)
    if (!lead) {
      throw new DomainException(`Lead ${leadId} was not found`)
    }

    const interactions = await this.interactionRepository.findByLeadId(leadId)

    return {
      lead: lead.toPrimitive(),
      interactions: interactions.map((item) => item.toPrimitive()),
    }
  }
}

export default GetLeadHistoryUseCase
