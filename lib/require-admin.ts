import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { resolveAdminAccess, type AdminSession, type AdminRecord } from '@/lib/dal'

export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const session: AdminSession =
    !error && data?.claims ? { id: data.claims.sub as string, email: data.claims.email as string } : null

  let adminRecord: AdminRecord = session
    ? await prisma.admin.findUnique({ where: { supabaseUserId: session.id } })
    : null

  if (session && !adminRecord) {
    const unlinked = await prisma.admin.findFirst({
      where: { email: session.email, supabaseUserId: null },
    })
    if (unlinked) {
      adminRecord = await prisma.admin.update({
        where: { id: unlinked.id },
        data: { supabaseUserId: session.id },
      })
    }
  }

  const result = resolveAdminAccess(session, adminRecord)

  if (result.status === 'unauthenticated') {
    redirect('/admin/login')
  }
  if (result.status === 'forbidden') {
    // Sessão do Supabase ainda válida, mas o admin foi removido da tabela —
    // precisa encerrar a sessão de verdade (não só bloquear o acesso), senão
    // o cookie fica preso e a pessoa nunca mais consegue ver a tela de login
    // de novo (ver app/admin/access-denied/route.ts pro porquê disso não
    // pode acontecer aqui direto, dentro de um Server Component).
    redirect('/admin/access-denied')
  }

  return result.admin
})
