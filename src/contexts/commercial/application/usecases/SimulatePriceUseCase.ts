import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import AgeBracket, { AGE_BRACKETS, AgeBracketCode } from '../../domain/value-objects/AgeBracket'
import PersonType, { PersonTypeValue } from '../../domain/value-objects/PersonType'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface SimulatePriceDTO {
  personType: PersonTypeValue
  ageBracket: AgeBracketCode
  /** Only meaningful for a company contract. */
  lives?: number
}

export interface SimulatedPlan {
  planId: string
  code: string
  name: string
  carrier: string
  tier: string
  coverageType: string
  coverageArea: string
  accommodation: string
  featured: boolean
  /** Monthly total, in cents. */
  total: number
  /** Monthly price for one life, in cents. */
  perLife: number
}

export interface SimulationResult {
  personType: PersonTypeValue
  ageBracket: AgeBracketCode
  ageBracketLabel: string
  lives: number
  plans: SimulatedPlan[]
}

/** RF11 — estimate the monthly price of each plan for a given profile. */
export class SimulatePriceUseCase {
  constructor(private readonly healthPlanRepository: HealthPlanRepository) {}

  async execute(dto: SimulatePriceDTO): Promise<SimulationResult> {
    const personType = PersonType.create(dto.personType)
    const bracket = AgeBracket.create(dto.ageBracket)
    const lives = personType.isCompany() ? (dto.lives ?? 2) : 1

    if (personType.isCompany() && lives < 2) {
      throw new DomainException('A company contract covers at least two lives')
    }

    const plans = await this.healthPlanRepository.findAllActive()

    return {
      personType: personType.value,
      ageBracket: bracket.code,
      ageBracketLabel: bracket.label,
      lives,
      plans: plans.map((plan) => ({
        planId: plan.id,
        code: plan.code,
        name: plan.name,
        carrier: plan.carrier,
        tier: plan.tier,
        coverageType: plan.coverageType,
        coverageArea: plan.coverageArea,
        accommodation: plan.accommodation,
        featured: plan.featured,
        total: plan.priceFor(bracket, personType, lives).toPrimitive(),
        perLife: plan.pricePerLife(bracket).toPrimitive(),
      })),
    }
  }

  /** The bands offered in the simulator's dropdown. */
  listAgeBrackets() {
    return AGE_BRACKETS.map(({ code, label }) => ({ code, label }))
  }
}

export default SimulatePriceUseCase
