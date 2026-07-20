import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Obrigatório'),
  subtitle: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  coverImageUrl: z.string().url('Envie uma imagem'),
  buyUrl: z.string().url('URL inválida'),
  order: z.coerce.number().int(),
})

export type BookInput = z.infer<typeof bookSchema>
