import type { NextRequest } from 'next/server'
import { readJson, required, toErrorResponse } from '@/lib/api'
import { getContainer } from '@/lib/container'
import type { AgeBracketCode } from '@/contexts/commercial/domain/value-objects/AgeBracket'
import type { PersonTypeValue } from '@/contexts/commercial/domain/value-objects/PersonType'

interface Body {
  personType?: PersonTypeValue
  ageBracket?: AgeBracketCode
  lives?: number
}

/** RF11 — estimate the monthly price of every plan for a profile. Public. */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer()
    const body = await readJson<Body>(request)

    const result = await container.simulatePrice.execute({
      personType: required(body.personType, 'personType'),
      ageBracket: required(body.ageBracket, 'ageBracket'),
      lives: body.lives,
    })

    return Response.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

/** The age bands the simulator offers. */
export async function GET() {
  try {
    const container = await getContainer()

    return Response.json({ ageBrackets: container.simulatePrice.listAgeBrackets() })
  } catch (error) {
    return toErrorResponse(error)
  }
}
