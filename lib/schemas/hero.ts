import { z } from 'zod'

export const heroSchema = z.object({
  heroPhotoUrl: z.string().url('Envie uma foto'),
  heroPhotoMobileUrl: z.union([z.string().url(), z.literal('')]),
  heroHeadline: z.string().min(1, 'Obrigatório'),
  heroHighlight: z.string().min(1, 'Obrigatório'),
  heroIntro: z.string().min(1, 'Obrigatório'),
})

export type HeroInput = z.infer<typeof heroSchema>
