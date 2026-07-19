import { MessageCircle } from 'lucide-react'
import type { FooterSettings } from '@/lib/generated/prisma/client'

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Livros', href: '#livros' },
  { label: 'Ofertas', href: '#ofertas' },
]

export function Footer({ settings }: { settings: FooterSettings }) {
  return (
    <footer className="bg-popover">
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
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <YoutubeIcon className="size-4" />
              </a>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <MessageCircle className="size-4" />
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
