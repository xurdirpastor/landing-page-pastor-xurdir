import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export const getVideoHighlight = unstable_cache(
  async (): Promise<VideoHighlight> => {
    return prisma.videoHighlight.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['video-highlight'],
  { tags: ['video'] },
)
