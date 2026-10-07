import Lead, { LeadPrimitive } from '../../domain/entities/Lead'
import Interaction from '../../domain/entities/Interaction'
import LeadRepository from '../../domain/repositories/LeadRepository'
import InteractionRepository from '../../domain/repositories/InteractionRepository'
import UserRepository from '../../domain/repositories/UserRepository'
import { PersonTypeValue } from '../../domain/value-objects/PersonType'
import DomainException from '@/shared/domain/exceptions/DomainException'

export interface WebsiteLeadDTO {
  name: string
  email: string
  phone: string
  personType: PersonTypeValue
  company?: string | null
  message?: string | null
  /** Plan the visitor was looking at, or the quiz recommendation. */
  planOfInterest?: string | null
  /** Which page produced the lead: 'contact-form', 'quiz', 'simulator'. */
  origin?: string
}

export interface CaptureResult {
  lead: LeadPrimitive
  /** False when the contact was already on file and this became an interaction. */
  created: boolean
}

/**
 * RF06 and RNG08 — a visitor's form submission becomes a lead with no manual
 * re-typing.
 *
 * A returning visitor is not an error: RNG01 keeps one record per contact, so a
 * second submission is filed as an interaction against the existing lead rather
 * than being rejected, which would lose the enquiry.
 */
export class CaptureWebsiteLeadUseCase {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly interactionRepository: InteractionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: WebsiteLeadDTO): Promise<CaptureResult> {
    const origin = dto.origin ?? 'website'

    const [byEmail, byPhone] = await Promise.all([
      this.leadRepository.findByEmail(dto.email),
      this.leadRepository.findByPhone(dto.phone),
    ])
    const existing = byEmail ?? byPhone

    if (existing) {
      await this.interactionRepository.save(
        Interaction.create({
          leadId: existing.id,
          userId: existing.userId,
          type: 'NOTE',
          description: this.describeReturn(dto, origin),
        }),
      )
      return { lead: existing.toPrimitive(), created: false }
    }

    // `leads.usuario_id` is mandatory, so a website lead needs an owner.
    const owner = await this.userRepository.findDefaultSalesperson()
    if (!owner) {
      throw new DomainException(
        'No active salesperson is available to receive website leads',
      )
    }

    const lead = Lead.create({
      userId: owner.id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      personType: dto.personType,
      company: dto.company ?? null,
      planOfInterest: dto.planOfInterest ?? null,
      origin,
      notes: dto.message ?? null,
    })

    const saved = await this.leadRepository.save(lead)

    await this.interactionRepository.save(
      Interaction.create({
        leadId: saved.id,
        userId: owner.id,
        type: 'NOTE',
        description: this.describeCapture(dto, origin),
      }),
    )

    return { lead: saved.toPrimitive(), created: true }
  }

  private describeCapture(dto: WebsiteLeadDTO, origin: string): string {
    const parts = [`Contato recebido pelo site (${origin}).`]
    if (dto.planOfInterest) parts.push(`Plano de interesse: ${dto.planOfInterest}.`)
    if (dto.message) parts.push(`Mensagem: ${dto.message}`)
    return parts.join(' ')
  }

  private describeReturn(dto: WebsiteLeadDTO, origin: string): string {
    const parts = [`Novo contato pelo site (${origin}) de um lead já cadastrado.`]
    if (dto.planOfInterest) parts.push(`Plano de interesse: ${dto.planOfInterest}.`)
    if (dto.message) parts.push(`Mensagem: ${dto.message}`)
    return parts.join(' ')
  }
}

export default CaptureWebsiteLeadUseCase
