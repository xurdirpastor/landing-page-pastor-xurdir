import Link from 'next/link'
import { Card } from '@/components/ui/card'

const sections = [
  { href: '/admin/hero', title: 'Hero', description: 'Primeira coisa que o visitante vê na home.' },
  { href: '/admin/sobre', title: 'Sobre', description: 'Foto da família e os 3 pilares da apresentação.' },
  { href: '/admin/agenda', title: 'Agenda', description: 'Cultos, mentorias e pregações.' },
  { href: '/admin/livros', title: 'Livros', description: 'Livros publicados e links de compra.' },
  { href: '/admin/video', title: 'Vídeo em destaque', description: 'O vídeo exibido na home.' },
  { href: '/admin/depoimentos', title: 'Depoimentos', description: 'Vidas transformadas.' },
  { href: '/admin/ofertas', title: 'Ofertas', description: 'Pix e dados bancários.' },
  { href: '/admin/rodape', title: 'Rodapé', description: 'CNPJ, endereço e redes sociais.' },
  { href: '/admin/admins', title: 'Admins', description: 'Adicionar ou remover administradores.' },
]

export default function DashboardHomePage() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
      {sections.map((section) => (
        <Link key={section.href} href={section.href} className="block h-full">
          <Card className="h-full min-h-36 justify-start p-6 transition-colors hover:border-border-strong">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
