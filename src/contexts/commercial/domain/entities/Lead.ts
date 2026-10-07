import AggregateRoot, { AggregateRootPrimitive } from '@/shared/domain/base/AggregateRoot'
import DomainException from '@/shared/domain/exceptions/DomainException'
import Money from '@/shared/domain/value-objects/Money'
import Email from '../value-objects/Email'
import Phone from '../value-objects/Phone'
import LeadStatus, { LeadStatusValue } from '../value-objects/LeadStatus'
import PersonType, { PersonTypeValue } from '../value-objects/PersonType'
import LeadConverted from '../events/LeadConverted'

export interface LeadProps {
  id: string
  /** Salesperson responsible for the lead — `leads.usuario_id`. */
  userId: string
  name: string
  company?: string | null
  role?: string | null
  email: Email | string
  phone: Phone | string
  personType: PersonType | string
  status?: LeadStatus | string
  planOfInterest?: string | null
  lives?: number
  estimatedValue?: Money | null
  origin?: string | null
  nextContactAt?: Date | null
  notes?: string | null
  hot?: boolean
  version?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface LeadPrimitive extends AggregateRootPrimitive {
  userId: string
  name: string
  company: string | null
  role: string | null
  email: string
  phone: string
  personType: PersonTypeValue
  status: LeadStatusValue
  planOfInterest: string | null
  lives: number
  estimatedValue: number | null
  origin: string | null
  nextContactAt: Date | null
  notes: string | null
  hot: boolean
}

export class Lead extends AggregateRoot {
  userId: string
  name: string
  company: string | null
  role: string | null
  email: Email
  phone: Phone
  personType: PersonType
  status: LeadStatus
  planOfInterest: string | null
  lives: number
  estimatedValue: Money | null
  origin: string | null
  nextContactAt: Date | null
  notes: string | null
  hot: boolean

  constructor(props: LeadProps) {
    super(props.id, props.createdAt, props.updatedAt, props.version ?? 0)

    this.userId = props.userId
    this.name = props.name
    this.company = props.company ?? null
    this.role = props.role ?? null
    this.email = props.email instanceof Email ? props.email : Email.create(props.email)
    this.phone = props.phone instanceof Phone ? props.phone : Phone.create(props.phone)
    this.personType =
      props.personType instanceof PersonType
        ? props.personType
        : PersonType.create(props.personType)
    this.status =
      props.status === undefined
        ? LeadStatus.create(LeadStatus.NEW)
        : props.status instanceof LeadStatus
          ? props.status
          : LeadStatus.create(props.status)
    this.planOfInterest = props.planOfInterest ?? null
    this.lives = props.lives ?? 1
    this.estimatedValue = props.estimatedValue ?? null
    this.origin = props.origin ?? null
    this.nextContactAt = props.nextContactAt ?? null
    this.notes = props.notes ?? null
    this.hot = props.hot ?? false

    this.validate()
  }

  /** How the lead is labelled in lists: the company for PJ, the person for PF. */
  get displayName(): string {
    return this.personType.isCompany() && this.company ? this.company : this.name
  }

  /** RF05 — move the lead along the funnel. */
  changeStatus(newStatus: LeadStatus | string): void {
    const next = newStatus instanceof LeadStatus ? newStatus : LeadStatus.create(newStatus)

    if (next.value === this.status.value) {
      return
    }
    if (this.status.value === LeadStatus.CONVERTED) {
      throw new DomainException('A converted lead cannot change status')
    }

    this.status = next
    this.touch()

    if (next.value === LeadStatus.CONVERTED) {
      this.addDomainEvent(new LeadConverted(this.id))
    }
  }

  /** RNG05 — called when the lead is turned into a client. */
  markAsConverted(): void {
    this.changeStatus(LeadStatus.CONVERTED)
  }

  markAsLost(reason?: string): void {
    this.changeStatus(LeadStatus.LOST)
    if (reason) {
      this.notes = reason
    }
  }

  isConverted(): boolean {
    return this.status.value === LeadStatus.CONVERTED
  }

  scheduleNextContact(date: Date | null): void {
    this.nextContactAt = date
    this.touch()
  }

  setHot(hot: boolean): void {
    this.hot = hot
    this.touch()
  }

  updateContactDetails(details: {
    name?: string
    company?: string | null
    role?: string | null
    email?: Email | string
    phone?: Phone | string
    notes?: string | null
  }): void {
    if (details.name !== undefined) this.name = details.name
    if (details.company !== undefined) this.company = details.company
    if (details.role !== undefined) this.role = details.role
    if (details.email !== undefined) {
      this.email = details.email instanceof Email ? details.email : Email.create(details.email)
    }
    if (details.phone !== undefined) {
      this.phone = details.phone instanceof Phone ? details.phone : Phone.create(details.phone)
    }
    if (details.notes !== undefined) this.notes = details.notes

    this.validate()
    this.touch()
  }

  private touch(): void {
    this.markAsUpdated()
    this.incrementVersion()
  }

  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Lead name is required')
    }
    if (!this.userId) {
      throw new DomainException('Lead must be assigned to a user')
    }
    if (this.personType.isCompany() && !this.company?.trim()) {
      throw new DomainException('A company lead requires a company name')
    }
    if (!Number.isInteger(this.lives) || this.lives < 1) {
      throw new DomainException(`Lead must cover at least one life, received ${this.lives}`)
    }
  }

  toPrimitive(): LeadPrimitive {
    return {
      ...super.toPrimitive(),
      userId: this.userId,
      name: this.name,
      company: this.company,
      role: this.role,
      email: this.email.toPrimitive(),
      phone: this.phone.toPrimitive(),
      personType: this.personType.toPrimitive(),
      status: this.status.toPrimitive(),
      planOfInterest: this.planOfInterest,
      lives: this.lives,
      estimatedValue: this.estimatedValue ? this.estimatedValue.toPrimitive() : null,
      origin: this.origin,
      nextContactAt: this.nextContactAt,
      notes: this.notes,
      hot: this.hot,
    }
  }

  /** A brand new lead, always starting at the first funnel stage. */
  static create(props: Omit<LeadProps, 'id' | 'status' | 'version'> & { id?: string }): Lead {
    return new Lead({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      status: LeadStatus.NEW,
      version: 0,
    })
  }
}

export default Lead
