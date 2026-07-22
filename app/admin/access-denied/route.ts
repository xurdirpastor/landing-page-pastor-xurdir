import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Route Handler, não Server Action: `requireAdmin()` chega aqui via redirect()
// de dentro de um Server Component, e cookies só podem ser escritos (o
// signOut() precisa disso) numa Server Action ou Route Handler — nunca num
// Server Component. Ver lib/supabase/server.ts (setAll engole o erro fora
// desses dois contextos) e o mesmo motivo documentado em app/auth/confirm/route.ts.
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/?deniedAccess=1')
}
