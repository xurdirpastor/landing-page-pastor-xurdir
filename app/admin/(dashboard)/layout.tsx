import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/require-admin'
import { Sidebar } from '@/components/admin/sidebar'
import { LogoutButton } from '@/components/admin/logout-button'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-sm text-muted-foreground">
            {admin.name} · {admin.email}
          </span>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
