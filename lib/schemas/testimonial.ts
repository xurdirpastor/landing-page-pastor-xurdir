import { z } from 'zod'

export const AVATAR_COLORS = [
  '#3159C7',
  '#4C8CFF',
  '#FF7A3D',
  '#293868',
  '#2D3444',
  '#8A91A3',
] as const

export const testimonialSchema = z.object({
  quote: z.string().min(1, 'Obrigatório'),
  name: z.string().min(1, 'Obrigatório'),
  role: z.string().min(1, 'Obrigatório'),
  initials: z.string().min(1, 'Obrigatório').max(3, 'Máximo 3 caracteres'),
  avatarColor: z.enum(AVATAR_COLORS),
  order: z.coerce.number().int(),
})

export type TestimonialInput = z.infer<typeof testimonialSchema>
