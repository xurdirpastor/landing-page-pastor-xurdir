import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TestimonialForm } from '@/components/admin/testimonial-form'
import type { AVATAR_COLORS } from '@/lib/schemas/testimonial'

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await prisma.testimonial.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar depoimento</h1>
      <TestimonialForm
        id={item.id}
        initialValues={{
          quote: item.quote,
          name: item.name,
          role: item.role,
          initials: item.initials,
          avatarColor: item.avatarColor as (typeof AVATAR_COLORS)[number],
          order: String(item.order),
        }}
      />
    </div>
  )
}
