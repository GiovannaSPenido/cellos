import Entity, { EntityPrimitive } from '@/shared/domain/base/Entity'
import DomainException from '@/shared/domain/exceptions/DomainException'
import Money from '@/shared/domain/value-objects/Money'
import AgeBracket from '../value-objects/AgeBracket'
import PersonType from '../value-objects/PersonType'

/** Volume discount applied to company contracts. */
export const COMPANY_VOLUME_FACTOR = 0.92

/** Ordinal rank of each commercial tier, used when ranking plans. */
const TIER_LEVELS: Record<string, number> = {
  Entrada: 1,
  Intermediário: 2,
  Avançado: 3,
  Premium: 4,
}

export interface HealthPlanProps {
  id: string
  code: string
  name: string
  carrier: string
  tier: string
  coverageType: string
  coverageArea: string
  accommodation: string
  hasCoPayment?: boolean
  hasReimbursement?: boolean
  network?: string | null
  waitingPeriod?: string | null
  basePrice: Money | number | string
  summary?: string | null
  featured?: boolean
  includes?: string[]
  excludes?: string[]
  active?: boolean
  createdAt?: Date
}

export interface HealthPlanPrimitive extends EntityPrimitive {
  code: string
  name: string
  carrier: string
  tier: string
  coverageType: string
  coverageArea: string
  accommodation: string
  hasCoPayment: boolean
  hasReimbursement: boolean
  network: string | null
  waitingPeriod: string | null
  basePrice: number
  summary: string | null
  featured: boolean
  includes: string[]
  excludes: string[]
  active: boolean
}

export class HealthPlan extends Entity {
  code: string
  name: string
  carrier: string
  tier: string
  coverageType: string
  coverageArea: string
  accommodation: string
  hasCoPayment: boolean
  hasReimbursement: boolean
  network: string | null
  waitingPeriod: string | null
  basePrice: Money
  summary: string | null
  featured: boolean
  includes: string[]
  excludes: string[]
  active: boolean

  constructor(props: HealthPlanProps) {
    super(props.id, props.createdAt)

    this.code = props.code
    this.name = props.name
    this.carrier = props.carrier
    this.tier = props.tier
    this.coverageType = props.coverageType
    this.coverageArea = props.coverageArea
    this.accommodation = props.accommodation
    this.hasCoPayment = props.hasCoPayment ?? false
    this.hasReimbursement = props.hasReimbursement ?? false
    this.network = props.network ?? null
    this.waitingPeriod = props.waitingPeriod ?? null
    this.basePrice =
      props.basePrice instanceof Money ? props.basePrice : Money.fromReais(props.basePrice)
    this.summary = props.summary ?? null
    this.featured = props.featured ?? false
    this.includes = props.includes ?? []
    this.excludes = props.excludes ?? []
    this.active = props.active ?? true

    this.validate()
  }

  // ----------------------------------------------------------------- pricing
  /** RF11 — monthly price for one life in the given age band. */
  pricePerLife(bracket: AgeBracket): Money {
    return this.basePrice.times(bracket.factor)
  }

  /**
   * RF11 — total monthly price. Company contracts price every life in the band
   * and apply the volume discount.
   */
  priceFor(bracket: AgeBracket, personType: PersonType, lives = 1): Money {
    if (!Number.isInteger(lives) || lives < 1) {
      throw new DomainException(`Cannot price ${lives} lives`)
    }
    if (personType.isIndividual()) {
      return this.pricePerLife(bracket)
    }
    return this.basePrice.times(bracket.factor * lives * COMPANY_VOLUME_FACTOR)
  }

  // ------------------------------------------------- traits used for ranking
  /** Commercial rank, derived from the tier rather than a parallel lookup table. */
  get level(): number {
    return TIER_LEVELS[this.tier] ?? 1
  }

  get isNationwide(): boolean {
    return /nacional/i.test(this.coverageArea)
  }

  get isStatewide(): boolean {
    return this.isNationwide || /estadual/i.test(this.coverageArea)
  }

  get coversMaternity(): boolean {
    return /obst[eé]tric/i.test(this.coverageType)
  }

  get hasPrivateRoom(): boolean {
    return /apartamento/i.test(this.accommodation)
  }

  validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Health plan requires a code')
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Health plan requires a name')
    }
    if (!this.carrier || this.carrier.trim().length === 0) {
      throw new DomainException('Health plan requires a carrier')
    }
  }

  toPrimitive(): HealthPlanPrimitive {
    return {
      ...super.toPrimitive(),
      code: this.code,
      name: this.name,
      carrier: this.carrier,
      tier: this.tier,
      coverageType: this.coverageType,
      coverageArea: this.coverageArea,
      accommodation: this.accommodation,
      hasCoPayment: this.hasCoPayment,
      hasReimbursement: this.hasReimbursement,
      network: this.network,
      waitingPeriod: this.waitingPeriod,
      basePrice: this.basePrice.toPrimitive(),
      summary: this.summary,
      featured: this.featured,
      includes: [...this.includes],
      excludes: [...this.excludes],
      active: this.active,
    }
  }
}

export default HealthPlan
