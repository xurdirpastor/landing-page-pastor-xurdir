import { z } from 'zod'

export const offeringSettingsSchema = z.object({
  pixKey: z.string().min(1, 'Obrigatório'),
  pixKeyType: z.enum(['email', 'cpf', 'cnpj', 'phone', 'random']),
  pixMerchantName: z.string().min(1, 'Obrigatório'),
  pixMerchantCity: z.string().min(1, 'Obrigatório'),
  nationalBank: z.string().min(1, 'Obrigatório'),
  nationalAgency: z.string().min(1, 'Obrigatório'),
  nationalAccount: z.string().min(1, 'Obrigatório'),
  nationalCnpj: z.string().min(1, 'Obrigatório'),
  intlBank: z.string().min(1, 'Obrigatório'),
  intlIban: z.string().min(1, 'Obrigatório'),
  intlSwift: z.string().min(1, 'Obrigatório'),
  intlAccountHolder: z.string().min(1, 'Obrigatório'),
})

export type OfferingSettingsInput = z.infer<typeof offeringSettingsSchema>
