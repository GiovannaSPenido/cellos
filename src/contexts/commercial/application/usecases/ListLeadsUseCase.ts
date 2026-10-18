import { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository, { LeadFilter } from '../../domain/repositories/LeadRepository'

/** RF03 — list leads, optionally narrowed by owner, funnel stage or search term. */
export class ListLeadsUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(filter: LeadFilter = {}): Promise<LeadPrimitive[]> {
    const leads = await this.leadRepository.findAll(filter)
    return leads.map((lead) => lead.toPrimitive())
  }
}

export default ListLeadsUseCase
