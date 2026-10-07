import { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository from '../../domain/repositories/LeadRepository'
import { LeadStatusValue } from '../../domain/value-objects/LeadStatus'
import DomainException from '@/shared/domain/exceptions/DomainException'

/**
 * RF05 — move a lead between funnel stages, which is what dragging a card
 * across the kanban does.
 */
export class ChangeLeadStatusUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(id: string, status: LeadStatusValue): Promise<LeadPrimitive> {
    const lead = await this.leadRepository.findById(id)
    if (!lead) {
      throw new DomainException(`Lead ${id} was not found`)
    }

    // Reaching CONVERTED happens through the conversion use case, which also
    // creates the client record; setting it here would leave the two out of step.
    if (status === 'CONVERTED') {
      throw new DomainException(
        'Converting a lead requires contract details — use ConvertLeadToClientUseCase',
      )
    }

    lead.changeStatus(status)

    const saved = await this.leadRepository.update(lead)
    return saved.toPrimitive()
  }
}

export default ChangeLeadStatusUseCase
