import Entity, { EntityPrimitive } from './Entity'

export interface DomainEvent {
  readonly name: string
  readonly occurredAt: Date
}

export interface AggregateRootPrimitive extends EntityPrimitive {
  version: number
}

export abstract class AggregateRoot extends Entity {
  private domainEvents: DomainEvent[] = []
  version: number

  constructor(id: string, createdAt?: Date, updatedAt?: Date, version = 0) {
    super(id, createdAt, updatedAt)
    this.version = version
  }

  /** Invariants that must hold for the aggregate to be valid. */
  abstract validate(): void

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event)
  }

  getDomainEvents(): readonly DomainEvent[] {
    return this.domainEvents
  }

  clearDomainEvents(): void {
    this.domainEvents = []
  }

  incrementVersion(): void {
    this.version++
  }

  toPrimitive(): AggregateRootPrimitive {
    return {
      ...super.toPrimitive(),
      version: this.version,
    }
  }
}

export default AggregateRoot
