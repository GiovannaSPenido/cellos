import Client, { ClientPrimitive } from '../../domain/entities/Client'
import ClientRepository from '../../domain/repositories/ClientRepository'
import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import LeadRepository from '../../domain/repositories/LeadRepository'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface ConvertLeadDTO {
  leadId: string
  planId: string
  /** Agreed monthly fee, in reais. */
  monthlyFee: number | string
  startsOn: Date
  renewsOn?: Date | null
  lives?: number
  city?: string | null
}

/**
 * RNG05 — turn a lead into a client. The lead row is kept and only flipped to
 * CONVERTED, so every interaction recorded while prospecting stays attached.
 *
 * The two writes cannot share a transaction, so the client is created first:
 * should the second write fail, the result is a client whose lead still shows
 * its old stage, and running this again repairs it. The reverse order would
 * leave a converted lead with no client and no way back, because a converted
 * lead refuses further status changes.
 */
export class ConvertLeadToClientUseCase {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly clientRepository: ClientRepository,
    private readonly healthPlanRepository: HealthPlanRepository,
  ) {}

  async execute(dto: ConvertLeadDTO): Promise<ClientPrimitive> {
    const lead = await this.leadRepository.findById(dto.leadId)
    if (!lead) {
      throw new DomainException(`Lead ${dto.leadId} was not found`)
    }

    const plan = await this.healthPlanRepository.findById(dto.planId)
    if (!plan) {
      throw new DomainException(`Health plan ${dto.planId} was not found`)
    }

    const existing = await this.clientRepository.findByLeadId(dto.leadId)

    if (existing) {
      // A previous run created the client but did not finish marking the lead.
      if (!lead.isConverted()) {
        lead.markAsConverted()
        await this.leadRepository.update(lead)
        return existing.toPrimitive()
      }
      throw new DomainException('This lead has already been converted into a client')
    }

    const client = Client.fromLead(lead, {
      planId: dto.planId,
      monthlyFee: dto.monthlyFee,
      startsOn: dto.startsOn,
      renewsOn: dto.renewsOn ?? null,
      lives: dto.lives,
      city: dto.city ?? null,
    })

    const saved = await this.clientRepository.save(client)

    lead.markAsConverted()
    await this.leadRepository.update(lead)

    return saved.toPrimitive()
  }
}

export default ConvertLeadToClientUseCase
