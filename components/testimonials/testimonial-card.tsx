import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="w-[360px] shrink-0 bg-card-gradient p-6">
      <p className="text-sm leading-[1.65] text-text-secondary">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <Avatar>
          <AvatarFallback
            style={{ backgroundColor: testimonial.avatarColor }}
            className="font-semibold text-white"
          >
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  )
}
