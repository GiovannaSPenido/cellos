import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/** Channel an interaction happened through (RF02, RNG03). */
export type InteractionTypeValue = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE'

export const INTERACTION_TYPE_VALUES: readonly InteractionTypeValue[] = [
  'CALL',
  'WHATSAPP',
  'EMAIL',
  'MEETING',
  'NOTE',
]

export class InteractionType extends ValueObject<InteractionTypeValue> {
  static readonly CALL: InteractionTypeValue = 'CALL'
  static readonly WHATSAPP: InteractionTypeValue = 'WHATSAPP'
  static readonly EMAIL: InteractionTypeValue = 'EMAIL'
  static readonly MEETING: InteractionTypeValue = 'MEETING'
  static readonly NOTE: InteractionTypeValue = 'NOTE'

  readonly value: InteractionTypeValue

  constructor(value: string) {
    super()
    if (!INTERACTION_TYPE_VALUES.includes(value as InteractionTypeValue)) {
      throw new DomainException(`Invalid interaction type: ${value}`)
    }
    this.value = value as InteractionTypeValue
  }

  toPrimitive(): InteractionTypeValue {
    return this.value
  }

  static create(value: string): InteractionType {
    return new InteractionType(value)
  }
}

export default InteractionType
