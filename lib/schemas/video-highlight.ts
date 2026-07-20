import { z } from 'zod'

export const videoHighlightSchema = z.object({
  eyebrow: z.string().min(1, 'Obrigatório'),
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
  thumbnailUrl: z.string().url('Envie uma imagem'),
  videoUrl: z.string().url('URL inválida'),
  durationLabel: z.string().min(1, 'Obrigatório'),
  ctaLabel: z.string().min(1, 'Obrigatório'),
})

export type VideoHighlightInput = z.infer<typeof videoHighlightSchema>
