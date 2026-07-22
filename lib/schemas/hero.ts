import { z } from 'zod'

const ctaHrefSchema = z
  .string()
  .min(1, 'Obrigatório')
  .refine(
    (val) => val.startsWith('#') || /^https?:\/\//.test(val),
    'Use uma âncora (ex.: #agenda) ou um link completo (https://...)'
  )

export const heroSchema = z.object({
  heroPhotoUrl: z.string().url('Envie uma foto'),
  heroPhotoMobileUrl: z.union([z.string().url(), z.literal('')]),
  heroShowBadge: z.boolean(),
  heroHeadline: z.string().min(1, 'Obrigatório'),
  heroHighlight: z.string().min(1, 'Obrigatório'),
  heroIntro: z.string().min(1, 'Obrigatório'),
  ctas: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Obrigatório'),
        href: ctaHrefSchema,
        variant: z.enum(['primary', 'secondary']),
      })
    )
    .max(2, 'No máximo 2 botões'),
})

export type HeroInput = z.infer<typeof heroSchema>
export type HeroCtaInput = HeroInput['ctas'][number]
