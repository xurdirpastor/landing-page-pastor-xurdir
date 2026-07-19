'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel'
import { AgendaCard } from './agenda-card'
import type { AgendaItem } from '@/lib/generated/prisma/client'

function CarouselDots() {
  const { api } = useCarousel()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

  if (scrollSnaps.length <= 1) return null

  return (
    <div className="mt-6 flex justify-center gap-2 nav:hidden">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Ir para o item ${index + 1}`}
          onClick={() => scrollTo(index)}
          className={cn(
            'size-2 rounded-full transition-colors',
            index === selectedIndex ? 'bg-primary' : 'bg-border-strong',
          )}
        />
      ))}
    </div>
  )
}

export function AgendaCarousel({ items }: { items: AgendaItem[] }) {
  return (
    <Carousel opts={{ align: 'start' }} className="mt-8">
      <CarouselContent className="-ml-6">
        {items.map((item) => (
          <CarouselItem key={item.id} className="basis-auto pl-6">
            <AgendaCard item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 hidden justify-end gap-2 nav:flex">
        <CarouselPrevious className="static translate-x-0" />
        <CarouselNext className="static translate-x-0" />
      </div>
      <CarouselDots />
    </Carousel>
  )
}
