import { z } from 'zod'

export const addAdminSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(1, 'Obrigatório'),
})

export type AddAdminInput = z.infer<typeof addAdminSchema>
