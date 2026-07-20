'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const emailSchema = z.string().email('E-mail inválido')

export type SignInResult = { success: true } | { success: false; error: string }

export async function signIn(email: string): Promise<SignInResult> {
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data } })
  if (admin) {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({ email: parsed.data })
    if (error) {
      console.error('signInWithOtp failed:', error.message)
      // Mensagem genérica de propósito — não menciona rate limit nem confirma
      // que o e-mail é de admin, só que o envio falhou desta vez.
      return { success: false, error: 'Não foi possível enviar o link agora. Tente novamente em alguns minutos.' }
    }
  }

  // Mesma resposta de sucesso, o e-mail sendo de admin ou não —
  // nunca revelar quem está cadastrado (spec da Fase 0 §4.1).
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
