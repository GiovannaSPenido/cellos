import { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository from '../../domain/repositories/LeadRepository'

export class ListLeadsUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(): Promise<LeadPrimitive[]> {
    const leads = await this.leadRepository.findAll()
    return leads.map((lead) => lead.toPrimitive())
  }
}

export default ListLeadsUseCase
