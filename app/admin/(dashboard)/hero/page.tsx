import { prisma } from '@/lib/prisma'
import { HeroForm } from '@/components/admin/hero-form'

export default async function HeroAdminPage() {
  const profile = await prisma.pastorProfile.findUniqueOrThrow({ where: { id: 'singleton' } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Hero</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Primeira coisa que o visitante vê na home.
        </p>
      </div>
      <HeroForm
        initialValues={{
          heroPhotoUrl: profile.heroPhotoUrl,
          heroPhotoMobileUrl: profile.heroPhotoMobileUrl ?? '',
          heroHeadline: profile.heroHeadline,
          heroHighlight: profile.heroHighlight,
          heroIntro: profile.heroIntro,
        }}
      />
    </div>
  )
}
