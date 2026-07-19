'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { AgendaCard } from './agenda-card'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaCarousel({ items }: { items: AgendaItem[] }) {
  return (
    <Carousel opts={{ align: 'start', dragFree: true }} className="mt-8">
      <CarouselContent className="-ml-6">
        {items.map((item) => (
          <CarouselItem key={item.id} className="basis-auto pl-6">
            <AgendaCard item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-end gap-2">
        <CarouselPrevious className="static translate-x-0" />
        <CarouselNext className="static translate-x-0" />
      </div>
    </Carousel>
  )
}
