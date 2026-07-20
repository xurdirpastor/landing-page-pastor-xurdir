import { AdminModalPage } from '@/components/admin/admin-modal-page'
import { TestimonialForm } from '@/components/admin/testimonial-form'
import { AVATAR_COLORS } from '@/lib/schemas/testimonial'

export default function NewTestimonialPage() {
  return (
    <AdminModalPage title="Novo depoimento" backHref="/admin/depoimentos">
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
    </AdminModalPage>
  )
}
