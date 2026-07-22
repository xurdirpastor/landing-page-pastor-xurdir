'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { headerSchema } from '@/lib/schemas/header'
import { zodIssuesToFieldErrors, type ActionResult } from '@/lib/actions/types'

export async function saveHeaderSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = headerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  const { navLinks, ...settings } = parsed.data

  await prisma.$transaction([
    prisma.headerSettings.update({ where: { id: 'singleton' }, data: settings }),
    prisma.navLink.deleteMany(),
    prisma.navLink.createMany({
      data: navLinks.map((link, index) => ({
        label: link.label,
        href: link.href,
        order: index,
      })),
    }),
  ])

  revalidateTag('header', { expire: 0 })
  return { success: true }
}
