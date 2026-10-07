import DomainException from '../exceptions/DomainException'

export interface EntityPrimitive {
  id: string
  createdAt: Date
  updatedAt: Date
}

export abstract class Entity {
  readonly id: string
  createdAt: Date
  updatedAt: Date

  /**
   * `createdAt` and `updatedAt` are optional so an entity rehydrated from the
   * database keeps its stored timestamps instead of being stamped as new.
   */
  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    if (!id) {
      throw new DomainException('Entity must have an ID')
    }
    this.id = id
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? this.createdAt
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Entity)) {
      return false
    }
    return this.id === other.id
  }

  markAsUpdated(): void {
    this.updatedAt = new Date()
  }

  toPrimitive(): EntityPrimitive {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export default Entity
