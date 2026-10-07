import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/** Brazilian phone: optional parentheses around the area code, optional 9th digit, optional hyphen. */
const PHONE_PATTERN = /^\(?[0-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/

export class Phone extends ValueObject<string> {
  readonly value: string

  constructor(value: string) {
    super()
    this.value = Phone.validate(value)
  }

  private static validate(value: string): string {
    if (!value || !PHONE_PATTERN.test(value)) {
      throw new DomainException(`Invalid phone number: ${value}`)
    }
    return value
  }

  toPrimitive(): string {
    return this.value
  }

  static create(value: string): Phone {
    return new Phone(value)
  }
}

export default Phone
