import { FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import { LogoMark } from '@/components/brand/logo-mark'
import type { FooterSettings } from '@/lib/generated/prisma/client'

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Livros', href: '#livros' },
  { label: 'Ofertas', href: '#ofertas' },
]

type FooterProps = {
  settings: FooterSettings
  ministryName: string
  headerLogoUrl?: string | null
}

export function Footer({ settings, ministryName, headerLogoUrl }: FooterProps) {
  const logoUrl = settings.logoUrl || headerLogoUrl

  return (
    <footer className="bg-popover">
      <div className="divider-glow" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 nav:grid-cols-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <LogoMark logoUrl={logoUrl} size="footer" />
              {settings.showLogoText && (
                <span className="font-heading text-lg font-semibold text-foreground">
                  {ministryName}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {settings.institutionalText && <p>{settings.institutionalText}</p>}
              {settings.cnpj && <p>CNPJ {settings.cnpj}</p>}
              {settings.address && <p>{settings.address}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Ministério</h3>
            <nav className="mt-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Redes sociais</h3>
            <div className="mt-4 flex gap-3">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <FaInstagram className="size-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <FaYoutube className="size-4" />
              </a>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <FaWhatsapp className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 nav:flex-row nav:items-center nav:justify-between">
          <p className="text-xs text-muted-foreground">{settings.copyrightText}</p>
          <p className="text-xs text-muted-foreground">Feito com fé e propósito.</p>
        </div>
      </div>
    </footer>
  )
}
