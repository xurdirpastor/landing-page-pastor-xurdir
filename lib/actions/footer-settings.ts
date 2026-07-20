'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { footerSettingsSchema } from '@/lib/schemas/footer-settings'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveFooterSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = footerSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.footerSettings.update({ where: { id: 'singleton' }, data: parsed.data })
  revalidateTag('footer', { expire: 0 })
  return { success: true }
}
