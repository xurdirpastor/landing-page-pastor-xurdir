import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'

const NAV_ITEMS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Palavra', href: '#video' },
  { label: 'Livros', href: '#livros' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Ofertas', href: '#ofertas' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
            SL
          </span>
          <span className="font-heading text-lg font-semibold text-foreground">Seja Livre</span>
        </a>

        <nav className="hidden items-center gap-8 nav:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden nav:block">
          <Button render={<a href="#agenda" />} nativeButton={false} className="rounded-full">
            Fale Conosco
          </Button>
        </div>

        <MobileMenu items={NAV_ITEMS} />
      </div>
    </header>
  )
}
