'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { heroSchema } from '@/lib/schemas/hero'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveHeroContent(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = heroSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  const { heroPhotoMobileUrl, ...hero } = parsed.data

  await prisma.pastorProfile.update({
    where: { id: 'singleton' },
    data: { ...hero, heroPhotoMobileUrl: heroPhotoMobileUrl || null },
  })

  revalidateTag('about', { expire: 0 })
  return { success: true }
}
