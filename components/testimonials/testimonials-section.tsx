import { TestimonialCard } from './testimonial-card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="depoimentos" className="bg-popover py-[88px]">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
          Depoimentos
        </p>
        <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
          Vidas transformadas
        </h2>
      </div>
      <div
        className="mx-auto mt-10 grid max-w-6xl gap-6 px-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </section>
  )
}
