'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LuMenu } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

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

function useIsActive(href: string) {
  const pathname = usePathname()
  return href === '/admin' ? pathname === href : pathname.startsWith(href)
}

function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useIsActive(href)
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary',
        isActive && 'bg-secondary text-foreground'
      )}
    >
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <nav className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} label={link.label} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'md:hidden')}
      >
        <LuMenu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Seja Livre</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <li key={link.href}>
              <SheetClose
                render={<Link href={link.href} />}
                nativeButton={false}
                className="block rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary"
              >
                {link.label}
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
