import type { NextRequest } from 'next/server'
import { readJson, required, toErrorResponse } from '@/lib/api'
import { getServiceRoleContainer } from '@/lib/container'
import type { WebsiteLeadDTO } from '@/contexts/commercial/application/usecases/CaptureWebsiteLeadUseCase'

/**
 * RF06 and RNG08 — a visitor's enquiry becomes a lead with no re-typing.
 *
 * Public and unauthenticated, so it runs with the service role: a visitor has
 * no session, and `leads` grants anon no insert policy. Nothing from the body
 * reaches a privileged field — the use case assigns the owner itself.
 */
export async function POST(request: NextRequest) {
  try {
    const container = getServiceRoleContainer()
    const body = await readJson<Partial<WebsiteLeadDTO>>(request)

    const result = await container.captureWebsiteLead.execute({
      name: required(body.name, 'name'),
      email: required(body.email, 'email'),
      phone: required(body.phone, 'phone'),
      personType: required(body.personType, 'personType'),
      company: body.company ?? null,
      message: body.message ?? null,
      planOfInterest: body.planOfInterest ?? null,
      origin: body.origin,
    })

    // The same answer either way: whether the contact was already on file is
    // not a visitor's business, and saying so would leak who is a customer.
    return Response.json(
      { ok: true, message: 'Recebemos seu contato. Um corretor falará com você em breve.' },
      { status: result.created ? 201 : 200 },
    )
  } catch (error) {
    return toErrorResponse(error)
  }
}
