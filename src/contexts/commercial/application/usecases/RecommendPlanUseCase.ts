import HealthPlan from '../../domain/entities/HealthPlan'
import HealthPlanRepository from '../../domain/repositories/HealthPlanRepository'
import AgeBracket, { AgeBracketCode } from '../../domain/value-objects/AgeBracket'
import PersonType from '../../domain/value-objects/PersonType'
import DomainException from '@/shared/domain/exceptions/DomainException'

export type QuizAudience = 'self' | 'family' | 'company'
export type QuizPriority = 'price' | 'network' | 'coverage' | 'maternity'
export type QuizArea = 'regional' | 'statewide' | 'nationwide'
export type QuizAccommodation = 'any' | 'ward' | 'private'

/** The five answers collected by the guided flow (RF12). */
export interface QuizAnswers {
  audience: QuizAudience
  ageBracket: AgeBracketCode
  priority: QuizPriority
  area: QuizArea
  accommodation: QuizAccommodation
  lives?: number
}

export interface RankedPlan {
  planId: string
  code: string
  name: string
  carrier: string
  tier: string
  summary: string | null
  coverageType: string
  coverageArea: string
  accommodation: string
  /** Estimated monthly price for the answered profile, in cents. */
  estimatedPrice: number
  score: number
  /** Short phrases explaining why this plan fits. */
  reasons: string[]
}

export interface RecommendationResult {
  best: RankedPlan
  alternatives: RankedPlan[]
  ageBracketLabel: string
}

/**
 * RF12 — score the catalogue against the visitor's answers and recommend a plan.
 *
 * Plan traits come from each plan's own coverage fields, so a plan added to the
 * catalogue is ranked correctly without touching this code.
 */
export class RecommendPlanUseCase {
  constructor(private readonly healthPlanRepository: HealthPlanRepository) {}

  async execute(answers: QuizAnswers): Promise<RecommendationResult> {
    const plans = await this.healthPlanRepository.findAllActive()
    if (plans.length === 0) {
      throw new DomainException('There are no active plans to recommend')
    }

    const bracket = AgeBracket.create(answers.ageBracket)
    const personType = PersonType.create(answers.audience === 'company' ? 'PJ' : 'PF')
    const lives = answers.audience === 'company' ? (answers.lives ?? 2) : 1

    const ranked = plans
      .map((plan) => this.score(plan, answers, bracket, personType, lives))
      .sort((a, b) => b.score - a.score)

    return {
      best: ranked[0],
      alternatives: ranked.slice(1, 3),
      ageBracketLabel: bracket.label,
    }
  }

  private score(
    plan: HealthPlan,
    answers: QuizAnswers,
    bracket: AgeBracket,
    personType: PersonType,
    lives: number,
  ): RankedPlan {
    let score = 0
    const reasons: string[] = []

    // What matters most to the visitor.
    switch (answers.priority) {
      case 'price':
        score += (1000 - plan.basePrice.reais) / 90
        if (plan.level <= 2) reasons.push('mensalidade acessível')
        break
      case 'network':
        score += plan.level * 1.5 + (plan.isNationwide ? 4 : 0)
        if (plan.level >= 3) reasons.push('rede ampla de hospitais')
        break
      case 'coverage':
        score += plan.level * 2.2
        if (plan.level >= 3) reasons.push('cobertura completa')
        break
      case 'maternity':
        score += plan.coversMaternity ? 6 : -12
        if (plan.coversMaternity) reasons.push('cobertura obstétrica e parto')
        break
    }

    // Where they want to be treated.
    switch (answers.area) {
      case 'regional':
        score += plan.level === 1 ? 3 : 1
        break
      case 'statewide':
        score += plan.isStatewide ? 3 : 0
        if (plan.isStatewide) reasons.push('cobertura em todo o estado')
        break
      case 'nationwide':
        score += plan.isNationwide ? 5 : -4
        if (plan.isNationwide) reasons.push('abrangência nacional')
        break
    }

    // Room preference if they are admitted.
    if (answers.accommodation === 'private') {
      score += plan.hasPrivateRoom ? 4 : -3
      if (plan.hasPrivateRoom) reasons.push('quarto privativo')
    } else if (answers.accommodation === 'ward') {
      score += plan.hasPrivateRoom ? -0.5 : 1.5
    }

    // Who the plan is for.
    if (answers.audience === 'company' && plan.level >= 2 && plan.level <= 3) {
      score += 1.5
    }
    if (answers.audience === 'family' && plan.level >= 2) {
      score += 1.2
    }

    if (plan.hasReimbursement && answers.priority === 'network') {
      reasons.push('reembolso fora da rede')
    }

    return {
      planId: plan.id,
      code: plan.code,
      name: plan.name,
      carrier: plan.carrier,
      tier: plan.tier,
      summary: plan.summary,
      coverageType: plan.coverageType,
      coverageArea: plan.coverageArea,
      accommodation: plan.accommodation,
      estimatedPrice: plan.priceFor(bracket, personType, lives).toPrimitive(),
      score: Math.round(score * 100) / 100,
      reasons: [...new Set(reasons)].slice(0, 3),
    }
  }
}

export default RecommendPlanUseCase
