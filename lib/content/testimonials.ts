import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Testimonial } from '@/lib/generated/prisma/client'

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    return prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    })
  },
  ['testimonials'],
  { tags: ['testimonials'] },
)
