import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { getPillarIcon } from '@/lib/icons/pillar-icons'
import type { PastorProfile, AboutPillar } from '@/lib/generated/prisma/client'

export function AboutSection({
  profile,
  pillars,
}: {
  profile: PastorProfile
  pillars: AboutPillar[]
}) {
  return (
    <section id="sobre" className="bg-popover">
      <div className="divider-glow" />
      <div className="mx-auto max-w-6xl px-6 py-[88px]">
        <div className="grid items-center gap-10 nav:grid-cols-[1fr_320px]">
          <div className="text-center nav:text-left">
            <p className="text-sm font-bold tracking-[1.3px] text-blue-accent-text uppercase">
              {profile.aboutEyebrow}
            </p>
            <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
              {profile.aboutHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-text-secondary nav:mx-0">
              {profile.aboutIntro}
            </p>
          </div>

          <div className="relative mx-auto aspect-4/3 w-full max-w-[280px] overflow-hidden rounded-lg shadow-md">
            <Image
              src={profile.familyPhotoUrl}
              alt="Família do Pastor Xurdir"
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>
        </div>

        <div
          className="mt-12 grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.icon)
            return (
              <Card key={pillar.id} className="bg-card-gradient p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.65] text-text-secondary">
                  {pillar.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
