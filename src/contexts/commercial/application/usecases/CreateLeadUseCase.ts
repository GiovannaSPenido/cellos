import Lead, { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository from '../../domain/repositories/LeadRepository'
import CreateLeadDTO from '../dtos/CreateLeadDTO'
import DomainException from '@/shared/domain/exceptions/DomainException'

export class CreateLeadUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(dto: CreateLeadDTO): Promise<LeadPrimitive> {
    const existing = await this.leadRepository.findByEmail(dto.email)
    if (existing) {
      throw new DomainException('A lead with this email already exists')
    }

    const lead = Lead.create(
      crypto.randomUUID(),
      dto.name,
      dto.email,
      dto.phone,
      dto.healthPlan ?? null,
    )

    await this.leadRepository.save(lead)

    return lead.toPrimitive()
  }
}

export default CreateLeadUseCase
