import { z } from 'zod'

export const linkSchema = z
  .string()
  .min(1, 'Obrigatório')
  .refine(
    (val) => val.startsWith('#') || /^https?:\/\//.test(val),
    'Use uma âncora (ex.: #agenda) ou um link completo (https://...)'
  )
