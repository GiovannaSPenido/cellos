import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/**
 * The six ANS age bands used to price a plan (RF11). `factor` multiplies the
 * plan's base price.
 */
export interface AgeBracketDefinition {
  readonly code: AgeBracketCode
  readonly label: string
  readonly minAge: number
  readonly maxAge: number | null
  readonly factor: number
}

export type AgeBracketCode = '0-18' | '19-28' | '29-38' | '39-48' | '49-58' | '59+'

export const AGE_BRACKETS: readonly AgeBracketDefinition[] = [
  { code: '0-18', label: '0–18 anos', minAge: 0, maxAge: 18, factor: 0.75 },
  { code: '19-28', label: '19–28 anos', minAge: 19, maxAge: 28, factor: 1.0 },
  { code: '29-38', label: '29–38 anos', minAge: 29, maxAge: 38, factor: 1.22 },
  { code: '39-48', label: '39–48 anos', minAge: 39, maxAge: 48, factor: 1.55 },
  { code: '49-58', label: '49–58 anos', minAge: 49, maxAge: 58, factor: 2.1 },
  { code: '59+', label: '59+ anos', minAge: 59, maxAge: null, factor: 3.05 },
]

export class AgeBracket extends ValueObject<AgeBracketCode> {
  readonly definition: AgeBracketDefinition

  constructor(code: string) {
    super()
    this.definition = AgeBracket.resolve(code)
  }

  private static resolve(code: string): AgeBracketDefinition {
    const found = AGE_BRACKETS.find((b) => b.code === code)
    if (!found) {
      throw new DomainException(`Invalid age bracket: ${code}`)
    }
    return found
  }

  get code(): AgeBracketCode {
    return this.definition.code
  }

  get factor(): number {
    return this.definition.factor
  }

  get label(): string {
    return this.definition.label
  }

  toPrimitive(): AgeBracketCode {
    return this.definition.code
  }

  static create(code: string): AgeBracket {
    return new AgeBracket(code)
  }

  /** Bracket that contains a given age. */
  static forAge(age: number): AgeBracket {
    if (!Number.isFinite(age) || age < 0) {
      throw new DomainException(`Invalid age: ${age}`)
    }
    const found = AGE_BRACKETS.find(
      (b) => age >= b.minAge && (b.maxAge === null || age <= b.maxAge),
    )
    if (!found) {
      throw new DomainException(`No age bracket for age ${age}`)
    }
    return new AgeBracket(found.code)
  }
}

export default AgeBracket
