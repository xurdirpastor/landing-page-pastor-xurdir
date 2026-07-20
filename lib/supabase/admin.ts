// No `server-only` guard here on purpose: this client is also used by
// scripts/generate-magic-link.ts, a plain `bun run` script outside Next's
// bundler — `server-only`'s throwing stub isn't swapped for a no-op there,
// so it would break the script. The service-role key already can't reach a
// client bundle since it's not a `NEXT_PUBLIC_` var.
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
