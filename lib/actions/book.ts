'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { bookSchema } from '@/lib/schemas/book'
import {
  zodIssuesToFieldErrors,
  type ActionResult,
  type SimpleActionResult,
} from '@/lib/actions/types'

export async function createBook(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = bookSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.book.create({ data: { ...parsed.data, isPublished: true } })
  revalidateTag('books', { expire: 0 })
  return { success: true }
}

export async function updateBook(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = bookSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.book.update({ where: { id }, data: parsed.data })
  revalidateTag('books', { expire: 0 })
  return { success: true }
}

export async function deleteBook(id: string): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.book.delete({ where: { id } })
  revalidateTag('books', { expire: 0 })
  return { success: true }
}

export async function toggleBookPublished(
  id: string,
  isPublished: boolean
): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.book.update({ where: { id }, data: { isPublished } })
  revalidateTag('books', { expire: 0 })
  return { success: true }
}
