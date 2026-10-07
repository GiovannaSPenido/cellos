import ValueObject from '../base/ValueObject'
import DomainException from '../exceptions/DomainException'

/** Matches a decimal with at most two fractional digits. */
const DECIMAL = /^(\d+)(?:[.,](\d{1,2}))?$/

/**
 * An amount in Brazilian reais, held as integer cents so arithmetic is exact.
 * Supports RNF03: no floating-point drift in monetary values.
 */
export class Money extends ValueObject<number> {
  readonly cents: number

  private constructor(cents: number) {
    super()
    if (!Number.isInteger(cents)) {
      throw new DomainException(`Money requires whole cents, received ${cents}`)
    }
    if (cents < 0) {
      throw new DomainException(`Money cannot be negative, received ${cents}`)
    }
    this.cents = cents
  }

  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  /**
   * Parses reais without going through binary floating point — the string form
   * a Postgres `numeric` column returns is converted digit by digit.
   */
  static fromReais(value: number | string): Money {
    const text = typeof value === 'number' ? value.toFixed(2) : value.trim()
    const match = DECIMAL.exec(text)
    if (!match) {
      throw new DomainException(`Invalid monetary value: ${value}`)
    }
    const whole = Number.parseInt(match[1], 10)
    const fraction = Number.parseInt((match[2] ?? '0').padEnd(2, '0'), 10)
    return new Money(whole * 100 + fraction)
  }

  static zero(): Money {
    return new Money(0)
  }

  get reais(): number {
    return this.cents / 100
  }

  plus(other: Money): Money {
    return new Money(this.cents + other.cents)
  }

  minus(other: Money): Money {
    return new Money(this.cents - other.cents)
  }

  /** Multiplies by a factor, rounding to the nearest cent. */
  times(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new DomainException(`Invalid factor: ${factor}`)
    }
    return new Money(Math.round(this.cents * factor))
  }

  isZero(): boolean {
    return this.cents === 0
  }

  /** Decimal string for a `numeric(10,2)` column. */
  toDatabaseValue(): string {
    const whole = Math.trunc(this.cents / 100)
    const fraction = this.cents % 100
    return `${whole}.${String(fraction).padStart(2, '0')}`
  }

  format(): string {
    return this.reais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  toPrimitive(): number {
    return this.cents
  }
}

export default Money
