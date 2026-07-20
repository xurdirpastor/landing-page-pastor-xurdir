import { AdminModalPage } from '@/components/admin/admin-modal-page'
import { AgendaItemForm } from '@/components/admin/agenda-item-form'

export default function NewAgendaItemPage() {
  return (
    <AdminModalPage title="Novo item de agenda" backHref="/admin/agenda">
      <AgendaItemForm
        initialValues={{
          title: '',
          type: 'presencial',
          date: new Date().toISOString().slice(0, 10),
          dateLabel: '',
          location: '',
          imageUrl: '',
          linkUrl: '',
          order: 0,
        }}
      />
    </AdminModalPage>
  )
}
