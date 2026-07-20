import { AgendaItemForm } from '@/components/admin/agenda-item-form'

export default function NewAgendaItemPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo item de agenda</h1>
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
    </div>
  )
}
