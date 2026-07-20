import { prisma } from '@/lib/prisma'
import { OfferingSettingsForm } from '@/components/admin/offering-settings-form'

export default async function OfferingsAdminPage() {
  const settings = await prisma.offeringSettings.findUniqueOrThrow({ where: { id: 'singleton' } })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Ofertas</h1>
      <OfferingSettingsForm
        initialValues={{
          pixKey: settings.pixKey,
          pixKeyType: settings.pixKeyType,
          pixMerchantName: settings.pixMerchantName,
          pixMerchantCity: settings.pixMerchantCity,
          nationalBank: settings.nationalBank,
          nationalAgency: settings.nationalAgency,
          nationalAccount: settings.nationalAccount,
          nationalCnpj: settings.nationalCnpj,
          intlBank: settings.intlBank,
          intlIban: settings.intlIban,
          intlSwift: settings.intlSwift,
          intlAccountHolder: settings.intlAccountHolder,
        }}
      />
    </div>
  )
}
