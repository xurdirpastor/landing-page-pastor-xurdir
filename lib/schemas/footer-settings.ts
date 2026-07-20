import { z } from 'zod'

export const footerSettingsSchema = z.object({
  logoUrl: z.union([z.string().url(), z.literal('')]),
  cnpj: z.string().min(1, 'Obrigatório'),
  address: z.string().min(1, 'Obrigatório'),
  instagramUrl: z.string().url('URL inválida'),
  youtubeUrl: z.string().url('URL inválida'),
  whatsappUrl: z.string().url('URL inválida'),
  copyrightText: z.string().min(1, 'Obrigatório'),
})

export type FooterSettingsInput = z.infer<typeof footerSettingsSchema>
