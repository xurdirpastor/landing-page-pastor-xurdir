import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { OfferingSettings } from '@/lib/generated/prisma/client'

export const getOfferingSettings = unstable_cache(
  async (): Promise<OfferingSettings> => {
    return prisma.offeringSettings.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['offering-settings'],
  { tags: ['offerings'] },
)
