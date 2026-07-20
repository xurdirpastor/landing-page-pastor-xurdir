'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { offeringSettingsSchema } from '@/lib/schemas/offering-settings'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveOfferingSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = offeringSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.offeringSettings.update({ where: { id: 'singleton' }, data: parsed.data })
  revalidateTag('offerings', { expire: 0 })
  return { success: true }
}
