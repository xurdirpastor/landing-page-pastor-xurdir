'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { aboutContentSchema } from '@/lib/schemas/about-content'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveAboutContent(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = aboutContentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  const { pillars, ...profile } = parsed.data

  await prisma.$transaction([
    prisma.pastorProfile.update({ where: { id: 'singleton' }, data: profile }),
    ...pillars.map((pillar) =>
      prisma.aboutPillar.update({
        where: { id: pillar.id },
        data: { icon: pillar.icon, title: pillar.title, description: pillar.description },
      })
    ),
  ])

  revalidateTag('about', { expire: 0 })
  return { success: true }
}
