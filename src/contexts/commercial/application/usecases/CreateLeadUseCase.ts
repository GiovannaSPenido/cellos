import Lead, { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository from '../../domain/repositories/LeadRepository'
import CreateLeadDTO from '../dtos/CreateLeadDTO'
import Money from '@/shared/domain/value-objects/Money'
import DomainException from '@/shared/domain/exceptions/DomainException'

export class CreateLeadUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(dto: CreateLeadDTO): Promise<LeadPrimitive> {
    // RNG01 — one record per contact: neither the e-mail nor the phone may repeat.
    const [byEmail, byPhone] = await Promise.all([
      this.leadRepository.findByEmail(dto.email),
      this.leadRepository.findByPhone(dto.phone),
    ])

    if (byEmail) {
      throw new DomainException('A lead with this e-mail already exists')
    }
    if (byPhone) {
      throw new DomainException('A lead with this phone number already exists')
    }

    const lead = Lead.create({
      userId: dto.userId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      personType: dto.personType,
      company: dto.company ?? null,
      role: dto.role ?? null,
      planOfInterest: dto.planOfInterest ?? null,
      lives: dto.lives ?? 1,
      estimatedValue:
        dto.estimatedValue === null || dto.estimatedValue === undefined
          ? null
          : Money.fromReais(dto.estimatedValue),
      origin: dto.origin ?? null,
      notes: dto.notes ?? null,
    })

    const saved = await this.leadRepository.save(lead)

    return saved.toPrimitive()
  }
}

export default CreateLeadUseCase
