import { Button } from '@/components/ui/button'
import type { PastorProfile, HeroCta } from '@/lib/generated/prisma/client'

type HeroSectionProps = {
  profile: PastorProfile
  ministryName: string
  ctas: HeroCta[]
}

export function HeroSection({ profile, ministryName, ctas }: HeroSectionProps) {
  return (
    <section id="hero" className="relative flex min-h-[640px] items-center overflow-hidden">
      <picture className="contents">
        {profile.heroPhotoMobileUrl && (
          <source media="(max-width: 859px)" srcSet={profile.heroPhotoMobileUrl} />
        )}
        <img
          src={profile.heroPhotoUrl}
          alt="Pastor Xurdir"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 from-0% via-black/60 via-65% to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
        {profile.heroShowBadge && (
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-background/60 px-4 py-1.5 text-xs font-bold tracking-wide text-foreground uppercase">
            <span className="size-1.5 rounded-full bg-blue-accent" />
            Ministério {ministryName}
          </span>
        )}

        <h1 className="max-w-2xl font-heading text-[clamp(36px,5vw,58px)] leading-[1.1] font-semibold text-foreground">
          {profile.heroHeadline}
        </h1>
        <p className="max-w-2xl font-caveat text-[clamp(45px,6.25vw,72.5px)] leading-[1.25em] text-primary">
          {profile.heroHighlight}
        </p>

        <p className="mt-6 max-w-xl text-base leading-[1.7] text-text-secondary">
          {profile.heroIntro}
        </p>

        {ctas.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {ctas.map((cta) =>
              cta.variant === 'primary' ? (
                <Button
                  key={cta.id}
                  render={<a href={cta.href} />}
                  nativeButton={false}
                  className="h-12 rounded-full px-7 text-[15px] font-bold"
                >
                  {cta.label}
                </Button>
              ) : (
                <Button
                  key={cta.id}
                  render={<a href={cta.href} />}
                  nativeButton={false}
                  variant="outline"
                  className="h-12 rounded-full border-border-strong bg-background/60 px-7 text-[15px] font-bold text-foreground backdrop-blur-sm hover:bg-background/80"
                >
                  {cta.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
