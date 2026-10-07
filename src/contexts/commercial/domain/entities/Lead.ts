import AggregateRoot, { AggregateRootPrimitive } from '@/shared/domain/base/AggregateRoot'
import DomainException from '@/shared/domain/exceptions/DomainException'
import Email from '../value-objects/Email'
import Phone from '../value-objects/Phone'
import LeadStatus, { LeadStatusValue } from '../value-objects/LeadStatus'

/**
 * Plain interaction data carried on the aggregate. Phase 2 promotes this to a
 * first-class `Interacao` entity backed by its own table.
 */
export interface LeadInteraction {
  date: string
  type: string
  description: string
}

export interface LeadPrimitive extends AggregateRootPrimitive {
  name: string
  email: string
  phone: string
  status: LeadStatusValue
  healthPlan: string | null
  interactions: LeadInteraction[]
}

export class Lead extends AggregateRoot {
  name: string
  email: Email
  phone: Phone
  status: LeadStatus
  healthPlan: string | null
  interactions: LeadInteraction[] = []

  constructor(
    id: string,
    name: string,
    email: Email | string,
    phone: Phone | string,
    status: LeadStatus | string = LeadStatus.NEW,
    healthPlan: string | null = null,
  ) {
    super(id)
    this.name = name
    this.email = email instanceof Email ? email : Email.create(email)
    this.phone = phone instanceof Phone ? phone : Phone.create(phone)
    this.status = status instanceof LeadStatus ? status : LeadStatus.create(status)
    this.healthPlan = healthPlan
    this.validate()
  }

  addInteraction(interaction: LeadInteraction): void {
    this.interactions.push(interaction)
    this.markAsUpdated()
  }

  changeStatus(newStatus: LeadStatus | string): void {
    this.status = newStatus instanceof LeadStatus ? newStatus : LeadStatus.create(newStatus)
    this.markAsUpdated()
    this.incrementVersion()
  }

  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Lead name is required')
    }
  }

  toPrimitive(): LeadPrimitive {
    return {
      ...super.toPrimitive(),
      name: this.name,
      email: this.email.toPrimitive(),
      phone: this.phone.toPrimitive(),
      status: this.status.toPrimitive(),
      healthPlan: this.healthPlan,
      interactions: [...this.interactions],
    }
  }

  static create(
    id: string,
    name: string,
    email: Email | string,
    phone: Phone | string,
    healthPlan: string | null = null,
  ): Lead {
    return new Lead(id, name, email, phone, LeadStatus.NEW, healthPlan)
  }
}

export default Lead
