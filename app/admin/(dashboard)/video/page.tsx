import { prisma } from '@/lib/prisma'
import { VideoHighlightForm } from '@/components/admin/video-highlight-form'

export default async function VideoAdminPage() {
  const video = await prisma.videoHighlight.findUniqueOrThrow({ where: { id: 'singleton' } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Vídeo em destaque</h1>
        <p className="mt-1 text-sm text-muted-foreground">O vídeo exibido na home.</p>
      </div>
      <VideoHighlightForm
        initialValues={{
          eyebrow: video.eyebrow,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          durationLabel: video.durationLabel,
          ctaLabel: video.ctaLabel,
        }}
      />
    </div>
  )
}
