import Image from 'next/image'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export function VideoSection({ video }: { video: VideoHighlight }) {
  return (
    <section id="video" className="bg-popover py-[88px]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 nav:grid-cols-2">
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden rounded-lg shadow-md"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 860px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-background">
              <Play className="size-6 fill-current" />
            </span>
          </div>
          <span className="absolute right-4 bottom-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground">
            {video.durationLabel}
          </span>
        </a>

        <div>
          <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
            {video.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
            {video.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-[1.7] text-text-secondary">
            {video.description}
          </p>
          <Button
            render={<a href={video.videoUrl} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            className="mt-6 h-12 rounded-full px-7 text-[15px] font-bold"
          >
            {video.ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
