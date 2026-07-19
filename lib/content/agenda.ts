import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isAgendaItemVisible } from '@/lib/format/date'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export const getAgendaItems = unstable_cache(
  async (): Promise<AgendaItem[]> => {
    const items = await prisma.agendaItem.findMany({ orderBy: { order: 'asc' } })
    const now = new Date()
    return items.filter((item) => isAgendaItemVisible(item, now))
  },
  ['agenda-items'],
  { tags: ['agenda'] },
)
