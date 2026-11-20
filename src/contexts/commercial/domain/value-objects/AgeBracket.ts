import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/**
 * As dez faixas etárias da ANS (RN 63/2003), usadas para precificar um plano
 * (RF11). Esta é a única fonte de faixas do sistema: o site, o formulário de
 * cotação e o módulo de gestão leem daqui.
 *
 * `factor` multiplica o preço base e serve apenas de reserva, para um plano que
 * ainda não tenha a tabela de preços por faixa preenchida. Os valores foram
 * derivados da média das tabelas reais enviadas pela corretora e respeitam os
 * dois limites da RN 63: a última faixa custa 5,96 vezes a primeira (teto de 6)
 * e a variação acumulada da sétima à décima faixa (134,5%) não supera a da
 * primeira à sétima (153,9%).
 */
export interface AgeBracketDefinition {
  readonly code: AgeBracketCode
  readonly label: string
  readonly minAge: number
  readonly maxAge: number | null
  readonly factor: number
}

export type AgeBracketCode =
  | '0-18' | '19-23' | '24-28' | '29-33' | '34-38'
  | '39-43' | '44-48' | '49-53' | '54-58' | '59+'

export const AGE_BRACKETS: readonly AgeBracketDefinition[] = [
  { code: '0-18', label: '0 a 18 anos', minAge: 0, maxAge: 18, factor: 0.812 },
  { code: '19-23', label: '19 a 23 anos', minAge: 19, maxAge: 23, factor: 1.0 },
  { code: '24-28', label: '24 a 28 anos', minAge: 24, maxAge: 28, factor: 1.192 },
  { code: '29-33', label: '29 a 33 anos', minAge: 29, maxAge: 33, factor: 1.364 },
  { code: '34-38', label: '34 a 38 anos', minAge: 34, maxAge: 38, factor: 1.499 },
  { code: '39-43', label: '39 a 43 anos', minAge: 39, maxAge: 43, factor: 1.665 },
  { code: '44-48', label: '44 a 48 anos', minAge: 44, maxAge: 48, factor: 2.061 },
  { code: '49-53', label: '49 a 53 anos', minAge: 49, maxAge: 53, factor: 2.501 },
  { code: '54-58', label: '54 a 58 anos', minAge: 54, maxAge: 58, factor: 3.219 },
  { code: '59+', label: '59 anos ou mais', minAge: 59, maxAge: null, factor: 4.833 },
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
