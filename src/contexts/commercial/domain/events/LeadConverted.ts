import { DomainEvent } from '@/shared/domain/base/AggregateRoot'

/**
 * Raised when a lead becomes a client (RNG05). The lead row is kept, so every
 * interaction recorded during prospecting stays reachable afterwards.
 */
export class LeadConverted implements DomainEvent {
  readonly name = 'LeadConverted'
  readonly occurredAt: Date

  constructor(readonly leadId: string) {
    this.occurredAt = new Date()
  }
}

export default LeadConverted
