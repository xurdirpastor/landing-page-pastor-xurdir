import { prisma } from '@/lib/prisma'
import { FooterSettingsForm } from '@/components/admin/footer-settings-form'

export default async function FooterAdminPage() {
  const settings = await prisma.footerSettings.findUniqueOrThrow({ where: { id: 'singleton' } })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Rodapé</h1>
      <FooterSettingsForm
        initialValues={{
          logoUrl: settings.logoUrl ?? '',
          cnpj: settings.cnpj,
          address: settings.address,
          instagramUrl: settings.instagramUrl,
          youtubeUrl: settings.youtubeUrl,
          whatsappUrl: settings.whatsappUrl,
          copyrightText: settings.copyrightText,
        }}
      />
    </div>
  )
}
