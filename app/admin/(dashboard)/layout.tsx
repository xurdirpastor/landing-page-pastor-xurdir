import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/require-admin'
import { Sidebar, MobileSidebar } from '@/components/admin/sidebar'
import { LogoutButton } from '@/components/admin/logout-button'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileSidebar />
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {admin.name} · {admin.email}
            </span>
          </div>
          <LogoutButton />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
