import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { PastorProfile, AboutPillar, HeroCta } from '@/lib/generated/prisma/client'

export const getPastorProfile = unstable_cache(
  async (): Promise<PastorProfile> => {
    return prisma.pastorProfile.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['pastor-profile'],
  { tags: ['about'] },
)

export const getAboutPillars = unstable_cache(
  async (): Promise<AboutPillar[]> => {
    return prisma.aboutPillar.findMany({ orderBy: { order: 'asc' } })
  },
  ['about-pillars'],
  { tags: ['about'] },
)

export const getHeroCtas = unstable_cache(
  async (): Promise<HeroCta[]> => {
    return prisma.heroCta.findMany({ orderBy: { order: 'asc' } })
  },
  ['hero-ctas'],
  { tags: ['about'] },
)
