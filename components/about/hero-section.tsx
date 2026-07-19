import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { PastorProfile } from '@/lib/generated/prisma/client'

export function HeroSection({ profile }: { profile: PastorProfile }) {
  return (
    <section id="hero" className="relative flex min-h-[640px] items-center overflow-hidden">
      <Image
        src={profile.heroPhotoUrl}
        alt="Pastor Xurdir"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-popover to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-background/60 px-4 py-1.5 text-xs font-bold tracking-wide text-foreground uppercase">
          <span className="size-1.5 rounded-full bg-blue-accent" />
          Ministério Seja Livre
        </span>

        <h1 className="max-w-2xl font-heading text-[clamp(36px,5vw,58px)] leading-[1.1] font-semibold text-foreground">
          {profile.heroHeadline}
        </h1>
        <p className="max-w-2xl font-caveat text-[1.25em] leading-[1.25em] text-primary">
          {profile.heroHighlight}
        </p>

        <p className="mt-6 max-w-xl text-base leading-[1.7] text-text-secondary">
          {profile.heroIntro}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button render={<a href="#video" />} className="rounded-full">
            Assista à última pregação
          </Button>
          <Button
            render={<a href="#agenda" />}
            variant="outline"
            className="rounded-full border-border-strong"
          >
            Ver agenda completa
          </Button>
        </div>
      </div>
    </section>
  )
}
