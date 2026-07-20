import { TestimonialForm } from '@/components/admin/testimonial-form'
import { AVATAR_COLORS } from '@/lib/schemas/testimonial'

export default function NewTestimonialPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo depoimento</h1>
      <TestimonialForm
        initialValues={{
          quote: '',
          name: '',
          role: '',
          initials: '',
          avatarColor: AVATAR_COLORS[0],
          order: '0',
        }}
      />
    </div>
  )
}
