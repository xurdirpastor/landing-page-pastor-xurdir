'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { videoHighlightSchema } from '@/lib/schemas/video-highlight'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveVideoHighlight(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = videoHighlightSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.videoHighlight.update({ where: { id: 'singleton' }, data: parsed.data })
  revalidateTag('video', { expire: 0 })
  return { success: true }
}
