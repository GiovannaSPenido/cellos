export interface CreateLeadDTO {
  name: string
  email: string
  phone: string
  healthPlan?: string | null
}

export default CreateLeadDTO
