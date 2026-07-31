import { z } from 'zod'

export const footerSettingsSchema = z.object({
  logoUrl: z.union([z.string().url(), z.literal('')]),
  showLogoText: z.boolean(),
  institutionalText: z.string(),
  cnpj: z.string(),
  address: z.string(),
  instagramUrl: z.string().url('URL inválida'),
  youtubeUrl: z.string().url('URL inválida'),
  whatsappUrl: z.string().url('URL inválida'),
  copyrightText: z.string().min(1, 'Obrigatório'),
})

export type FooterSettingsInput = z.infer<typeof footerSettingsSchema>
