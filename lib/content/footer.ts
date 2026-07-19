import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { FooterSettings } from '@/lib/generated/prisma/client'

export const getFooterSettings = unstable_cache(
  async (): Promise<FooterSettings> => {
    return prisma.footerSettings.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['footer-settings'],
  { tags: ['footer'] },
)
