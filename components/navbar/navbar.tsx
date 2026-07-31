import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/brand/logo-mark'
import { MobileMenu } from './mobile-menu'
import type { HeaderSettings, NavLink } from '@/lib/generated/prisma/client'

type NavbarProps = {
  showLogoText?: boolean
  settings: HeaderSettings
  navLinks: NavLink[]
}

export function Navbar({ showLogoText = true, settings, navLinks }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2">
          <LogoMark logoUrl={settings.logoUrl} />
          {showLogoText && (
            <span className="font-heading text-lg font-semibold text-foreground">
              {settings.ministryName}
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-8 nav:flex">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden nav:block">
          <Button
            render={<a href={settings.ctaHref} />}
            nativeButton={false}
            className="h-10 rounded-full px-5 text-sm font-bold"
          >
            {settings.ctaLabel}
          </Button>
        </div>

        <MobileMenu
          items={navLinks}
          ministryName={settings.ministryName}
          ctaLabel={settings.ctaLabel}
          ctaHref={settings.ctaHref}
        />
      </div>
    </header>
  )
}
