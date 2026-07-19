// lib/dal.ts
export type AdminSession = { id: string; email: string } | null

export type AdminRecord = {
  id: string
  email: string
  name: string
  supabaseUserId: string | null
  isSuperAdmin: boolean
} | null

export type AdminAccessResult =
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | {
      status: 'ok'
      admin: { id: string; email: string; name: string; isSuperAdmin: boolean }
    }

export function resolveAdminAccess(
  session: AdminSession,
  adminRecord: AdminRecord
): AdminAccessResult {
  if (!session) return { status: 'unauthenticated' }
  if (!adminRecord) return { status: 'forbidden' }

  return {
    status: 'ok',
    admin: {
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      isSuperAdmin: adminRecord.isSuperAdmin,
    },
  }
}

export function canRemoveAdmin(target: { isSuperAdmin: boolean }): boolean {
  return !target.isSuperAdmin
}
