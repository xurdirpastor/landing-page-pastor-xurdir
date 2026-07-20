'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { agendaItemSchema } from '@/lib/schemas/agenda-item'
import {
  zodIssuesToFieldErrors,
  type ActionResult,
  type SimpleActionResult,
} from '@/lib/actions/types'

export async function createAgendaItem(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = agendaItemSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.agendaItem.create({ data: { ...parsed.data, isPublished: true } })
  revalidateTag('agenda', { expire: 0 })
  return { success: true }
}

export async function updateAgendaItem(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = agendaItemSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  await prisma.agendaItem.update({ where: { id }, data: parsed.data })
  revalidateTag('agenda', { expire: 0 })
  return { success: true }
}

export async function deleteAgendaItem(id: string): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.agendaItem.delete({ where: { id } })
  revalidateTag('agenda', { expire: 0 })
  return { success: true }
}

export async function toggleAgendaItemPublished(
  id: string,
  isPublished: boolean
): Promise<SimpleActionResult> {
  await requireAdmin()
  await prisma.agendaItem.update({ where: { id }, data: { isPublished } })
  revalidateTag('agenda', { expire: 0 })
  return { success: true }
}
