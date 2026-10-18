import type { NextRequest } from 'next/server'
import { readJson, required, toErrorResponse } from '@/lib/api'
import { getContainer } from '@/lib/container'
import type { QuizAnswers } from '@/contexts/commercial/application/usecases/RecommendPlanUseCase'

/** RF12 — recommend a plan from the five answers of the guided flow. Public. */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer()
    const body = await readJson<Partial<QuizAnswers>>(request)

    const recommendation = await container.recommendPlan.execute({
      audience: required(body.audience, 'audience'),
      ageBracket: required(body.ageBracket, 'ageBracket'),
      priority: required(body.priority, 'priority'),
      area: required(body.area, 'area'),
      accommodation: required(body.accommodation, 'accommodation'),
      lives: body.lives,
    })

    return Response.json(recommendation)
  } catch (error) {
    return toErrorResponse(error)
  }
}
