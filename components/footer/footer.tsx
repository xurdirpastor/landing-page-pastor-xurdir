import { FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import type { FooterSettings } from '@/lib/generated/prisma/client'

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Livros', href: '#livros' },
  { label: 'Ofertas', href: '#ofertas' },
]

export function Footer({ settings }: { settings: FooterSettings }) {
  return (
    <footer className="bg-popover">
      <div className="divider-glow" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 nav:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
                SL
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">Seja Livre</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ministério Seja Livre — CNPJ {settings.cnpj}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{settings.address}</p>
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
