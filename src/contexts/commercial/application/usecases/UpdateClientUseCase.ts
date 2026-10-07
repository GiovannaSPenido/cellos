import { ClientPrimitive } from '../../domain/entities/Client'
import ClientRepository from '../../domain/repositories/ClientRepository'
import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import { ClientStatusValue } from '../../domain/value-objects/ClientStatus'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface UpdateClientDTO {
  /** Changing the plan requires the new monthly fee alongside it. */
  planId?: string
  monthlyFee?: number | string
  lives?: number
  renewsOn?: Date | null
  status?: ClientStatusValue
  city?: string | null
  contactPerson?: string | null
  opportunity?: string | null
}

/** RF04 — edit a client's contract details. */
export class UpdateClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly healthPlanRepository: HealthPlanRepository,
  ) {}

  async execute(id: string, dto: UpdateClientDTO): Promise<ClientPrimitive> {
    const client = await this.clientRepository.findById(id)
    if (!client) {
      throw new DomainException(`Client ${id} was not found`)
    }

    if (dto.planId && dto.planId !== client.planId) {
      const plan = await this.healthPlanRepository.findById(dto.planId)
      if (!plan) {
        throw new DomainException(`Health plan ${dto.planId} was not found`)
      }
      if (dto.monthlyFee === undefined) {
        throw new DomainException('Changing the plan requires the new monthly fee')
      }
      client.changePlan(dto.planId, dto.monthlyFee)
    } else if (dto.monthlyFee !== undefined) {
      client.changePlan(client.planId, dto.monthlyFee)
    }

    if (dto.lives !== undefined) client.lives = dto.lives
    if (dto.renewsOn !== undefined) client.renewsOn = dto.renewsOn
    if (dto.city !== undefined) client.city = dto.city
    if (dto.contactPerson !== undefined) client.contactPerson = dto.contactPerson
    if (dto.opportunity !== undefined) client.registerOpportunity(dto.opportunity)
    if (dto.status !== undefined) client.changeStatus(dto.status)

    client.validate()

    const saved = await this.clientRepository.update(client)
    return saved.toPrimitive()
  }
}

export default UpdateClientUseCase
