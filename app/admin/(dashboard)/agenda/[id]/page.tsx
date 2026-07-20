import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminModalPage } from '@/components/admin/admin-modal-page'
import { AgendaItemForm } from '@/components/admin/agenda-item-form'

export default async function EditAgendaItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await prisma.agendaItem.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <AdminModalPage title="Editar item de agenda" backHref="/admin/agenda">
      <AgendaItemForm
        id={item.id}
        initialValues={{
          title: item.title,
          type: item.type,
          date: item.date.toISOString().slice(0, 10),
          dateLabel: item.dateLabel,
          location: item.location,
          imageUrl: item.imageUrl,
          linkUrl: item.linkUrl,
          order: item.order,
        }}
      />
    </AdminModalPage>
  )
}
