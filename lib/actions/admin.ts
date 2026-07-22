'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { canRemoveAdmin } from '@/lib/dal'
import { addAdminSchema } from '@/lib/schemas/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  zodIssuesToFieldErrors,
  type ActionResult,
  type SimpleActionResult,
} from '@/lib/actions/types'

export async function addAdmin(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = addAdminSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, fieldErrors: zodIssuesToFieldErrors(parsed.error) }
  }

  const existing = await prisma.admin.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { success: false, fieldErrors: { email: ['Esse e-mail já está cadastrado como admin.'] } }
  }

  const admin = await prisma.admin.create({
    data: { email: parsed.data.email, name: parsed.data.name },
  })

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email)
  if (error) {
    console.error('inviteUserByEmail failed:', error.message)
  } else {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { supabaseUserId: data.user.id },
    })
  }

  return { success: true }
}

export async function removeAdmin(id: string): Promise<SimpleActionResult> {
  await requireAdmin()

  const target = await prisma.admin.findUnique({ where: { id } })
  if (!target) {
    return { success: false, message: 'Admin não encontrado.' }
  }
  if (!canRemoveAdmin(target)) {
    return { success: false, message: 'O admin principal não pode ser removido.' }
  }

  await prisma.admin.delete({ where: { id } })
  return { success: true }
}
