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

  if (!error) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { supabaseUserId: data.user.id },
    })
  } else if (error.code === 'email_exists') {
    // Já existe um usuário Supabase pra esse e-mail (ex.: tentativa de login
    // própria antes de existir o convite, ou um admin removido e recadastrado)
    // — inviteUserByEmail não reenvia nada nesse caso. Busca o id existente
    // direto em auth.users (mesmo Postgres, sem custo de rate limit — chamar
    // generateLink() aqui e depois signInWithOtp() em seguida bate no
    // cooldown de 60s do Supabase por contarem como o mesmo envio) e manda o
    // convite de verdade via signInWithOtp (Magic Link).
    const existingUser = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM auth.users WHERE email = ${parsed.data.email} LIMIT 1
    `
    if (existingUser[0]) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { supabaseUserId: existingUser[0].id },
      })
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: parsed.data.email })
    if (otpError) {
      console.error('signInWithOtp fallback failed:', otpError.message)
    }
  } else {
    console.error('inviteUserByEmail failed:', error.message)
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
