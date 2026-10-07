import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/** `PF` pessoa física, `PJ` pessoa jurídica — the two contracting types (RF01). */
export type PersonTypeValue = 'PF' | 'PJ'

export const PERSON_TYPE_VALUES: readonly PersonTypeValue[] = ['PF', 'PJ']

export class PersonType extends ValueObject<PersonTypeValue> {
  static readonly INDIVIDUAL: PersonTypeValue = 'PF'
  static readonly COMPANY: PersonTypeValue = 'PJ'

  readonly value: PersonTypeValue

  constructor(value: string) {
    super()
    if (!PERSON_TYPE_VALUES.includes(value as PersonTypeValue)) {
      throw new DomainException(`Invalid person type: ${value}`)
    }
    this.value = value as PersonTypeValue
  }

  isCompany(): boolean {
    return this.value === 'PJ'
  }

  isIndividual(): boolean {
    return this.value === 'PF'
  }

  toPrimitive(): PersonTypeValue {
    return this.value
  }

  static create(value: string): PersonType {
    return new PersonType(value)
  }
}

export default PersonType
