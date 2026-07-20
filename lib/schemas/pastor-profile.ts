import { z } from 'zod'

export const pastorProfileSchema = z.object({
  heroPhotoUrl: z.string().url('Envie uma foto'),
  heroHeadline: z.string().min(1, 'Obrigatório'),
  heroHighlight: z.string().min(1, 'Obrigatório'),
  heroIntro: z.string().min(1, 'Obrigatório'),
  familyPhotoUrl: z.string().url('Envie uma foto'),
  aboutEyebrow: z.string().min(1, 'Obrigatório'),
  aboutHeading: z.string().min(1, 'Obrigatório'),
  aboutIntro: z.string().min(1, 'Obrigatório'),
  pillars: z
    .array(
      z.object({
        id: z.string(),
        icon: z.string().min(1, 'Obrigatório'),
        title: z.string().min(1, 'Obrigatório'),
        description: z.string().min(1, 'Obrigatório'),
      })
    )
    .length(3, 'Devem existir exatamente 3 pilares'),
})

export type PastorProfileInput = z.infer<typeof pastorProfileSchema>
