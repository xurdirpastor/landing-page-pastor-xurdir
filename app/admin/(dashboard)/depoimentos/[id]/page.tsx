import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminModalPage } from '@/components/admin/admin-modal-page'
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
    <AdminModalPage title="Editar depoimento" backHref="/admin/depoimentos">
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
    </AdminModalPage>
  )
}
