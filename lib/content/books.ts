import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Book } from '@/lib/generated/prisma/client'

export const getBooks = unstable_cache(
  async (): Promise<Book[]> => {
    return prisma.book.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } })
  },
  ['books'],
  { tags: ['books'] },
)
