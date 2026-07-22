import { prisma } from '@/lib/prisma'
import { HeaderForm } from '@/components/admin/header-form'
import type { SiteAnchor } from '@/lib/constants/site-anchors'

export default async function HeaderAdminPage() {
  const [settings, navLinks] = await Promise.all([
    prisma.headerSettings.findUniqueOrThrow({ where: { id: 'singleton' } }),
    prisma.navLink.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Header</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nome do ministério, atalhos do menu e botão de contato.
        </p>
      </div>
      <HeaderForm
        initialValues={{
          ministryName: settings.ministryName,
          ctaLabel: settings.ctaLabel,
          ctaHref: settings.ctaHref,
          navLinks: navLinks.map((link) => ({
            id: link.id,
            label: link.label,
            href: link.href as SiteAnchor,
          })),
        }}
      />
    </div>
  )
}
