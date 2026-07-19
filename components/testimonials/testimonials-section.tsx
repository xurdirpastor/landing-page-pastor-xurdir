import { TestimonialCarousel } from './testimonial-carousel'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="depoimentos" className="bg-popover">
      <div className="divider-glow" />
      <div className="py-[88px]">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
            Depoimentos
          </p>
          <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
            Vidas transformadas
          </h2>
        </div>

        <TestimonialCarousel testimonials={testimonials} />
      </div>
    </section>
  )
}
