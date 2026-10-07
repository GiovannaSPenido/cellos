import Interaction, { InteractionPrimitive } from '../../domain/entities/Interaction'
import InteractionRepository from '../../domain/repositories/InteractionRepository'
import LeadRepository from '../../domain/repositories/LeadRepository'
import { InteractionTypeValue } from '../../domain/value-objects/InteractionType'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface RegisterInteractionDTO {
  leadId: string
  userId: string
  type: InteractionTypeValue
  description: string
  occurredAt?: Date
  /** Optionally reschedule the next contact in the same action. */
  nextContactAt?: Date | null
}

/** RF02 — record a contact with a lead. */
export class RegisterInteractionUseCase {
  constructor(
    private readonly interactionRepository: InteractionRepository,
    private readonly leadRepository: LeadRepository,
  ) {}

  async execute(dto: RegisterInteractionDTO): Promise<InteractionPrimitive> {
    // RNG02 — an interaction only exists against a lead already on file.
    const lead = await this.leadRepository.findById(dto.leadId)
    if (!lead) {
      throw new DomainException(`Lead ${dto.leadId} was not found`)
    }

    const interaction = Interaction.create({
      leadId: dto.leadId,
      userId: dto.userId,
      type: dto.type,
      description: dto.description,
      occurredAt: dto.occurredAt,
    })

    const saved = await this.interactionRepository.save(interaction)

    if (dto.nextContactAt !== undefined) {
      lead.scheduleNextContact(dto.nextContactAt)
      await this.leadRepository.update(lead)
    }

    return saved.toPrimitive()
  }
}

export default RegisterInteractionUseCase
