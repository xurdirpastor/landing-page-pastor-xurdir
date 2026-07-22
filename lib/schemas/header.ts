import { z } from 'zod'
import { SITE_ANCHOR_VALUES } from '@/lib/constants/site-anchors'

export const headerSchema = z.object({
  ministryName: z.string().min(1, 'Obrigatório'),
  ctaLabel: z.string().min(1, 'Obrigatório'),
  ctaHref: z.enum(SITE_ANCHOR_VALUES),
  navLinks: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Obrigatório'),
        href: z.enum(SITE_ANCHOR_VALUES),
      })
    )
    .min(1, 'Adicione ao menos 1 atalho'),
})

export type HeaderInput = z.infer<typeof headerSchema>
