import { prisma } from '@/lib/prisma'
import { AboutForm } from '@/components/admin/about-form'

export default async function AboutAdminPage() {
  const [profile, pillars] = await Promise.all([
    prisma.pastorProfile.findUniqueOrThrow({ where: { id: 'singleton' } }),
    prisma.aboutPillar.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Sobre</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Foto da família e os 3 pilares da apresentação.
        </p>
      </div>
      <AboutForm
        initialValues={{
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
