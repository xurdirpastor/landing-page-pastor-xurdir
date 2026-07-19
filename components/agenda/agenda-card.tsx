import Image from 'next/image'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AgendaBadge } from './agenda-badge'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaCard({ item }: { item: AgendaItem }) {
  return (
    <Card className="w-[340px] shrink-0 gap-0 bg-card-gradient p-0">
      <div className="relative aspect-4/3 w-full">
        <Image src={item.imageUrl} alt={item.title} fill sizes="340px" className="object-cover" />
        <AgendaBadge type={item.type} />
      </div>
      <div className="flex flex-col gap-3 px-5 py-5">
        <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="size-4" /> {item.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" /> {item.location}
          </span>
        </div>
        <a
          href={item.linkUrl}
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-accent-text hover:text-blue-accent-hover"
        >
          Saiba mais <ArrowRight className="size-4" />
        </a>
      </div>
    </Card>
  )
}
