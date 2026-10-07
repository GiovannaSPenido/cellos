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

  constructor(id: string) {
    if (!id) {
      throw new DomainException('Entity must have an ID')
    }
    this.id = id
    this.createdAt = new Date()
    this.updatedAt = new Date()
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
