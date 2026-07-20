import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Editar item de agenda
      </h1>
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
    </div>
  )
}
