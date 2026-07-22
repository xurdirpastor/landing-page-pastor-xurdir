'use client'

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

type NavItem = { id: string; label: string; href: string }

type MobileMenuProps = {
  items: NavItem[]
  ministryName: string
  ctaLabel: string
  ctaHref: string
}

export function MobileMenu({ items, ministryName, ctaLabel, ctaHref }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'nav:hidden')}
      >
        <LuMenu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{ministryName}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <SheetClose
              key={item.id}
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
            render={<a href={ctaHref} />}
            nativeButton={false}
            className={cn(buttonVariants(), 'h-11 w-full rounded-full text-[15px] font-bold')}
          >
            {ctaLabel}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
