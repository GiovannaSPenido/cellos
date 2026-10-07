import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/** The six funnel stages required by RF05. */
export type LeadStatusValue =
  | 'NEW'
  | 'IN_CONTACT'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST'

export const LEAD_STATUS_VALUES: readonly LeadStatusValue[] = [
  'NEW',
  'IN_CONTACT',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
]

export class LeadStatus extends ValueObject<LeadStatusValue> {
  static readonly NEW: LeadStatusValue = 'NEW'
  static readonly IN_CONTACT: LeadStatusValue = 'IN_CONTACT'
  static readonly PROPOSAL_SENT: LeadStatusValue = 'PROPOSAL_SENT'
  static readonly NEGOTIATION: LeadStatusValue = 'NEGOTIATION'
  static readonly CONVERTED: LeadStatusValue = 'CONVERTED'
  static readonly LOST: LeadStatusValue = 'LOST'

  readonly value: LeadStatusValue

  constructor(value: string) {
    super()
    this.value = LeadStatus.validate(value)
  }

  private static validate(value: string): LeadStatusValue {
    if (!LEAD_STATUS_VALUES.includes(value as LeadStatusValue)) {
      throw new DomainException(`Invalid lead status: ${value}`)
    }
    return value as LeadStatusValue
  }

  toPrimitive(): LeadStatusValue {
    return this.value
  }

  static create(value: string): LeadStatus {
    return new LeadStatus(value)
  }
}

export default LeadStatus
