'use client'

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { TestimonialCard } from './testimonial-card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Carousel opts={{ align: 'start', containScroll: false }} className="mt-10">
      <CarouselContent className="-ml-6">
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.id} className="basis-auto pl-6">
            <TestimonialCard testimonial={testimonial} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 hidden justify-end gap-2 nav:flex">
        <CarouselPrevious className="static translate-x-0" />
        <CarouselNext className="static translate-x-0" />
      </div>
      <CarouselDots className="mt-6 nav:hidden" />
    </Carousel>
  )
}
