'use client'

import { Menu } from 'lucide-react'
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

type NavItem = { label: string; href: string }

export function MobileMenu({ items }: { items: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'nav:hidden')}
      >
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Seja Livre</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <SheetClose
              key={item.href}
              render={<a href={item.href} />}
              nativeButton={false}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <SheetClose
            render={<a href="#agenda" />}
            nativeButton={false}
            className={cn(buttonVariants(), 'h-11 w-full rounded-full text-[15px] font-bold')}
          >
            Fale Conosco
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
