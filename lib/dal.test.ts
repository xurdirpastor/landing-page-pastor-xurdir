// lib/dal.test.ts
import { describe, it, expect } from 'bun:test'
import { resolveAdminAccess, canRemoveAdmin } from './dal'

describe('resolveAdminAccess', () => {
  it('returns unauthenticated when there is no session', () => {
    const result = resolveAdminAccess(null, null)
    expect(result).toEqual({ status: 'unauthenticated' })
  })

  it('returns forbidden when the session has no matching Admin row', () => {
    const session = { id: 'user-1', email: 'nao-admin@example.com' }
    const result = resolveAdminAccess(session, null)
    expect(result).toEqual({ status: 'forbidden' })
  })

  it('returns ok with the admin data when both session and record exist', () => {
    const session = { id: 'user-1', email: 'admin@example.com' }
    const adminRecord = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Fred',
      supabaseUserId: 'user-1',
      isSuperAdmin: true,
    }
    const result = resolveAdminAccess(session, adminRecord)
    expect(result).toEqual({
      status: 'ok',
      admin: { id: 'admin-1', email: 'admin@example.com', name: 'Fred', isSuperAdmin: true },
    })
  })
})

describe('canRemoveAdmin', () => {
  it('is false for a superAdmin', () => {
    expect(canRemoveAdmin({ isSuperAdmin: true })).toBe(false)
  })

  it('is true for a regular admin', () => {
    expect(canRemoveAdmin({ isSuperAdmin: false })).toBe(true)
  })
})
