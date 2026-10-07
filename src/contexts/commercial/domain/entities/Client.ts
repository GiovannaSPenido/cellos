import AggregateRoot, { AggregateRootPrimitive } from '@/shared/domain/base/AggregateRoot'
import DomainException from '@/shared/domain/exceptions/DomainException'
import Money from '@/shared/domain/value-objects/Money'
import ClientStatus, { ClientStatusValue } from '../value-objects/ClientStatus'
import Lead from './Lead'

/** A renewal this many days out or closer counts as an opportunity (RNG07). */
export const RENEWAL_WINDOW_DAYS = 75

const MS_PER_DAY = 86_400_000

export interface ClientProps {
  id: string
  /** The lead this client came from — `clientes.lead_id`, unique. */
  leadId: string
  planId: string
  lives?: number
  monthlyFee: Money | number | string
  startsOn: Date
  renewsOn?: Date | null
  status?: ClientStatus | string
  city?: string | null
  contactPerson?: string | null
  opportunity?: string | null
  version?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ClientPrimitive extends AggregateRootPrimitive {
  leadId: string
  planId: string
  lives: number
  monthlyFee: number
  startsOn: Date
  renewsOn: Date | null
  status: ClientStatusValue
  city: string | null
  contactPerson: string | null
  opportunity: string | null
}

export class Client extends AggregateRoot {
  leadId: string
  planId: string
  lives: number
  monthlyFee: Money
  startsOn: Date
  renewsOn: Date | null
  status: ClientStatus
  city: string | null
  contactPerson: string | null
  opportunity: string | null

  constructor(props: ClientProps) {
    super(props.id, props.createdAt, props.updatedAt, props.version ?? 0)

    this.leadId = props.leadId
    this.planId = props.planId
    this.lives = props.lives ?? 1
    this.monthlyFee =
      props.monthlyFee instanceof Money ? props.monthlyFee : Money.fromReais(props.monthlyFee)
    this.startsOn = props.startsOn
    this.renewsOn = props.renewsOn ?? null
    this.status =
      props.status === undefined
        ? ClientStatus.create(ClientStatus.ACTIVE)
        : props.status instanceof ClientStatus
          ? props.status
          : ClientStatus.create(props.status)
    this.city = props.city ?? null
    this.contactPerson = props.contactPerson ?? null
    this.opportunity = props.opportunity ?? null

    this.validate()
  }

  /** Days until renewal; negative once overdue, null when no renewal is set. */
  daysUntilRenewal(reference: Date = new Date()): number | null {
    if (!this.renewsOn) {
      return null
    }
    const from = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate())
    const to = Date.UTC(
      this.renewsOn.getFullYear(),
      this.renewsOn.getMonth(),
      this.renewsOn.getDate(),
    )
    return Math.round((to - from) / MS_PER_DAY)
  }

  /** RNG07 — renewal close enough to act on. */
  isRenewalDue(reference: Date = new Date(), withinDays: number = RENEWAL_WINDOW_DAYS): boolean {
    const days = this.daysUntilRenewal(reference)
    return days !== null && days <= withinDays
  }

  /** Monthly revenue per covered life. */
  feePerLife(): Money {
    return Money.fromCents(Math.round(this.monthlyFee.cents / this.lives))
  }

  changeStatus(newStatus: ClientStatus | string): void {
    this.status = newStatus instanceof ClientStatus ? newStatus : ClientStatus.create(newStatus)
    this.touch()
  }

  /** RNG07 — note a renewal or plan-change opportunity. */
  registerOpportunity(description: string | null): void {
    this.opportunity = description
    this.touch()
  }

  changePlan(planId: string, monthlyFee: Money | number | string): void {
    this.planId = planId
    this.monthlyFee = monthlyFee instanceof Money ? monthlyFee : Money.fromReais(monthlyFee)
    this.touch()
  }

  addLives(count: number): void {
    if (!Number.isInteger(count) || count < 1) {
      throw new DomainException(`Cannot add ${count} lives`)
    }
    this.lives += count
    this.touch()
  }

  private touch(): void {
    this.markAsUpdated()
    this.incrementVersion()
  }

  validate(): void {
    if (!this.leadId) {
      throw new DomainException('Client must reference the lead it came from')
    }
    if (!this.planId) {
      throw new DomainException('Client must reference a health plan')
    }
    if (!Number.isInteger(this.lives) || this.lives < 1) {
      throw new DomainException(`Client must cover at least one life, received ${this.lives}`)
    }
    if (this.renewsOn && this.renewsOn <= this.startsOn) {
      throw new DomainException('Renewal date must fall after the start of coverage')
    }
  }

  toPrimitive(): ClientPrimitive {
    return {
      ...super.toPrimitive(),
      leadId: this.leadId,
      planId: this.planId,
      lives: this.lives,
      monthlyFee: this.monthlyFee.toPrimitive(),
      startsOn: this.startsOn,
      renewsOn: this.renewsOn,
      status: this.status.toPrimitive(),
      city: this.city,
      contactPerson: this.contactPerson,
      opportunity: this.opportunity,
    }
  }

  /**
   * RNG05 — a client is born from a lead. The caller is responsible for also
   * marking the lead as converted and saving both in the same operation.
   */
  static fromLead(
    lead: Lead,
    contract: {
      planId: string
      monthlyFee: Money | number | string
      startsOn: Date
      renewsOn?: Date | null
      lives?: number
      city?: string | null
      id?: string
    },
  ): Client {
    if (lead.isConverted()) {
      throw new DomainException('This lead has already been converted')
    }

    return new Client({
      id: contract.id ?? crypto.randomUUID(),
      leadId: lead.id,
      planId: contract.planId,
      lives: contract.lives ?? lead.lives,
      monthlyFee: contract.monthlyFee,
      startsOn: contract.startsOn,
      renewsOn: contract.renewsOn ?? null,
      status: ClientStatus.ACTIVE,
      city: contract.city ?? null,
      contactPerson: lead.personType.isCompany() ? lead.name : null,
      version: 0,
    })
  }
}

export default Client
