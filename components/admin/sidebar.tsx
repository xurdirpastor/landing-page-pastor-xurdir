'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Início' },
  { href: '/admin/sobre', label: 'Sobre' },
  { href: '/admin/agenda', label: 'Agenda' },
  { href: '/admin/livros', label: 'Livros' },
  { href: '/admin/video', label: 'Vídeo' },
  { href: '/admin/depoimentos', label: 'Depoimentos' },
  { href: '/admin/ofertas', label: 'Ofertas' },
  { href: '/admin/rodape', label: 'Rodapé' },
  { href: '/admin/admins', label: 'Admins' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-56 shrink-0 border-r border-border p-4">
      <ul className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive =
            link.href === '/admin' ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary',
                  isActive && 'bg-secondary text-foreground'
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
