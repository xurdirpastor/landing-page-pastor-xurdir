'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LuPlay } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getVideoEmbed } from '@/lib/video/parse-video-embed'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export function VideoSection({ video }: { video: VideoHighlight }) {
  const [open, setOpen] = useState(false)
  const embed = getVideoEmbed(video.videoUrl)

  return (
    <section id="video" className="bg-popover">
      <div className="divider-glow" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-[88px] nav:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block aspect-video w-full overflow-hidden rounded-lg shadow-md"
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
              <LuPlay className="size-6 fill-current" />
            </span>
          </div>
          <span className="absolute right-4 bottom-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground">
            {video.durationLabel}
          </span>
        </button>

        <div>
          <p className="text-sm font-bold tracking-[1.3px] text-blue-accent-text uppercase nav:text-xl">
            {video.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
            {video.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-[1.7] text-text-secondary">
            {video.description}
          </p>
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 h-12 rounded-full px-7 text-[15px] font-bold"
          >
            {video.ctaLabel}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            {open && embed.type === 'file' && (
              <video src={embed.src} controls autoPlay className="size-full" />
            )}
            {open && embed.type !== 'file' && (
              <iframe
                src={embed.embedUrl}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
