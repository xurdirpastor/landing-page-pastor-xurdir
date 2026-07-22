import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { HeaderSettings, NavLink } from '@/lib/generated/prisma/client'

export const getHeaderSettings = unstable_cache(
  async (): Promise<HeaderSettings> => {
    return prisma.headerSettings.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['header-settings'],
  { tags: ['header'] },
)

export const getNavLinks = unstable_cache(
  async (): Promise<NavLink[]> => {
    return prisma.navLink.findMany({ orderBy: { order: 'asc' } })
  },
  ['nav-links'],
  { tags: ['header'] },
)
