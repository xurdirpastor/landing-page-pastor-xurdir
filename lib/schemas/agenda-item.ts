import { z } from 'zod'

export const agendaItemSchema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  type: z.enum(['presencial', 'online']),
  date: z.coerce.date(),
  dateLabel: z.string().min(1, 'Obrigatório'),
  location: z.string().min(1, 'Obrigatório'),
  imageUrl: z.string().url('Envie uma imagem'),
  linkUrl: z.string().url('URL inválida'),
  order: z.coerce.number().int(),
})

export type AgendaItemInput = z.infer<typeof agendaItemSchema>
