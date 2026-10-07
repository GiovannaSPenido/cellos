import Entity, { EntityPrimitive } from '@/shared/domain/base/Entity'
import DomainException from '@/shared/domain/exceptions/DomainException'
import InteractionType, { InteractionTypeValue } from '../value-objects/InteractionType'

export interface InteractionProps {
  id: string
  /** RNG02 — always bound to an existing lead. */
  leadId: string
  /** Who recorded it — `interacoes.usuario_id`. */
  userId: string
  type: InteractionType | string
  description: string
  occurredAt?: Date
  createdAt?: Date
}

export interface InteractionPrimitive extends EntityPrimitive {
  leadId: string
  userId: string
  type: InteractionTypeValue
  description: string
  occurredAt: Date
}

/**
 * One recorded contact with a lead (RF02). Append-only: the history is evidence
 * of what happened, so entries are never edited in place.
 *
 * Persisted separately from the Lead aggregate because the log grows without
 * bound, but it always belongs to exactly one lead.
 */
export class Interaction extends Entity {
  readonly leadId: string
  readonly userId: string
  readonly type: InteractionType
  readonly description: string
  readonly occurredAt: Date

  constructor(props: InteractionProps) {
    super(props.id, props.createdAt)

    this.leadId = props.leadId
    this.userId = props.userId
    this.type = props.type instanceof InteractionType ? props.type : InteractionType.create(props.type)
    this.description = props.description
    this.occurredAt = props.occurredAt ?? new Date()

    this.validate()
  }

  /** RNG03 — date, type and description are all mandatory. */
  private validate(): void {
    if (!this.leadId) {
      throw new DomainException('An interaction must reference a lead')
    }
    if (!this.userId) {
      throw new DomainException('An interaction must reference the user who recorded it')
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new DomainException('An interaction requires a description')
    }
    if (Number.isNaN(this.occurredAt.getTime())) {
      throw new DomainException('An interaction requires a valid date')
    }
  }

  toPrimitive(): InteractionPrimitive {
    return {
      ...super.toPrimitive(),
      leadId: this.leadId,
      userId: this.userId,
      type: this.type.toPrimitive(),
      description: this.description,
      occurredAt: this.occurredAt,
    }
  }

  static create(props: Omit<InteractionProps, 'id'> & { id?: string }): Interaction {
    return new Interaction({ ...props, id: props.id ?? crypto.randomUUID() })
  }
}

export default Interaction
