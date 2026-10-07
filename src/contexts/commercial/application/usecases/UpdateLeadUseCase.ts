import { LeadPrimitive } from '../../domain/entities/Lead'
import LeadRepository from '../../domain/repositories/LeadRepository'
import Money from '@/shared/domain/value-objects/Money'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface UpdateLeadDTO {
  name?: string
  company?: string | null
  role?: string | null
  email?: string
  phone?: string
  notes?: string | null
  planOfInterest?: string | null
  lives?: number
  estimatedValue?: number | string | null
  origin?: string | null
  nextContactAt?: Date | null
  hot?: boolean
}

/** RF04 — edit a lead's details. */
export class UpdateLeadUseCase {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(id: string, dto: UpdateLeadDTO): Promise<LeadPrimitive> {
    const lead = await this.leadRepository.findById(id)
    if (!lead) {
      throw new DomainException(`Lead ${id} was not found`)
    }

    // RNG01 — a changed e-mail or phone must not collide with another lead.
    if (dto.email && dto.email !== lead.email.value) {
      const other = await this.leadRepository.findByEmail(dto.email)
      if (other && other.id !== id) {
        throw new DomainException('Another lead already uses this e-mail')
      }
    }
    if (dto.phone && dto.phone !== lead.phone.value) {
      const other = await this.leadRepository.findByPhone(dto.phone)
      if (other && other.id !== id) {
        throw new DomainException('Another lead already uses this phone number')
      }
    }

    lead.updateContactDetails({
      name: dto.name,
      company: dto.company,
      role: dto.role,
      email: dto.email,
      phone: dto.phone,
      notes: dto.notes,
    })

    if (dto.planOfInterest !== undefined) lead.planOfInterest = dto.planOfInterest
    if (dto.lives !== undefined) lead.lives = dto.lives
    if (dto.origin !== undefined) lead.origin = dto.origin
    if (dto.estimatedValue !== undefined) {
      lead.estimatedValue =
        dto.estimatedValue === null ? null : Money.fromReais(dto.estimatedValue)
    }
    if (dto.nextContactAt !== undefined) lead.scheduleNextContact(dto.nextContactAt)
    if (dto.hot !== undefined) lead.setHot(dto.hot)

    lead.validate()

    const saved = await this.leadRepository.update(lead)
    return saved.toPrimitive()
  }
}

export default UpdateLeadUseCase
