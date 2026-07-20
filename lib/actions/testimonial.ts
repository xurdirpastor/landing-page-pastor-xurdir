'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { testimonialSchema } from '@/lib/schemas/testimonial'
import {
  zodIssuesToFieldErrors,
  type ActionResult,
  type SimpleActionResult,
} from '@/lib/actions/types'

export async function createTestimonial(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = testimonialSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.testimonial.create({ data: { ...parsed.data, isPublished: true } })
  revalidateTag('testimonials', { expire: 0 })
  return { success: true }
}

export async function updateTestimonial(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = testimonialSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.testimonial.update({ where: { id }, data: parsed.data })
  revalidateTag('testimonials', { expire: 0 })
  return { success: true }
}

export async function deleteTestimonial(id: string): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.testimonial.delete({ where: { id } })
  revalidateTag('testimonials', { expire: 0 })
  return { success: true }
}

export async function toggleTestimonialPublished(
  id: string,
  isPublished: boolean
): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.testimonial.update({ where: { id }, data: { isPublished } })
  revalidateTag('testimonials', { expire: 0 })
  return { success: true }
}
