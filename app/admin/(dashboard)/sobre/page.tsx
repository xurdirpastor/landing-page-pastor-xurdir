import { prisma } from '@/lib/prisma'
import { AboutForm } from '@/components/admin/about-form'

export default async function AboutAdminPage() {
  const [profile, pillars] = await Promise.all([
    prisma.pastorProfile.findUniqueOrThrow({ where: { id: 'singleton' } }),
    prisma.aboutPillar.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Sobre</h1>
      <AboutForm
        initialValues={{
          heroPhotoUrl: profile.heroPhotoUrl,
          heroHeadline: profile.heroHeadline,
          heroHighlight: profile.heroHighlight,
          heroIntro: profile.heroIntro,
          familyPhotoUrl: profile.familyPhotoUrl,
          aboutEyebrow: profile.aboutEyebrow,
          aboutHeading: profile.aboutHeading,
          aboutIntro: profile.aboutIntro,
          pillars: pillars.map((p) => ({
            id: p.id,
            icon: p.icon,
            title: p.title,
            description: p.description,
          })),
        }}
      />
    </div>
  )
}
