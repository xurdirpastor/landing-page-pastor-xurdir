// Utilitário só de dev: gera uma URL /auth/confirm de verdade pra um e-mail
// dado sem precisar de caixa de entrada — usado pra verificar o fluxo de
// login do admin de ponta a ponta no Playwright.
// Requer SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SITE_URL.
import { createAdminClient } from '../lib/supabase/admin'

const email = process.argv[2]
if (!email) {
  console.error('Usage: bun run scripts/generate-magic-link.ts <email>')
  process.exit(1)
}

const supabase = createAdminClient()
const { data, error } = await supabase.auth.admin.generateLink({ type: 'magiclink', email })

if (error) {
  console.error(error.message)
  process.exit(1)
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
console.log(`${siteUrl}/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink`)
