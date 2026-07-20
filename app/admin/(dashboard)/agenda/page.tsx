import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EntityTable } from '@/components/admin/entity-table'
import { deleteAgendaItem, toggleAgendaItemPublished } from '@/lib/actions/agenda-item'

export default async function AgendaListPage() {
  const items = await prisma.agendaItem.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Agenda</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cultos, mentorias e pregações.</p>
        </div>
        <Button render={<Link href="/admin/agenda/novo" />} nativeButton={false}>
          Novo item
        </Button>
      </div>
      <EntityTable
        items={items}
        columns={[
          { header: 'Título', render: (item) => item.title },
          {
            header: 'Tipo',
            render: (item) => (item.type === 'presencial' ? 'Presencial' : 'Online'),
          },
          { header: 'Data', render: (item) => item.dateLabel },
        ]}
        editHref={(item) => `/admin/agenda/${item.id}`}
        itemLabel={(item) => item.title}
        onTogglePublished={toggleAgendaItemPublished}
        onDelete={deleteAgendaItem}
        emptyLabel="Nenhum item de agenda cadastrado ainda."
      />
    </div>
  )
}
