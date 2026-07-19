'use client'

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel'
import { TestimonialCard } from './testimonial-card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Carousel opts={{ align: 'start' }} className="mx-auto mt-10 max-w-6xl">
      <div className="nav:[mask-image:linear-gradient(to_right,transparent,black_64px,black_calc(100%-64px),transparent)]">
        <CarouselContent className="-ml-6 px-6">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="basis-auto pl-6">
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
      <CarouselDots className="mt-6 nav:hidden" />
    </Carousel>
  )
}
