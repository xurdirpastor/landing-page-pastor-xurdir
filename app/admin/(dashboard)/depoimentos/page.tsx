import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EntityTable } from '@/components/admin/entity-table'
import { deleteTestimonial, toggleTestimonialPublished } from '@/lib/actions/testimonial'

export default async function TestimonialsListPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Depoimentos</h1>
        <Button render={<Link href="/admin/depoimentos/novo" />} nativeButton={false}>
          Novo depoimento
        </Button>
      </div>
      <EntityTable
        items={items}
        columns={[
          { header: 'Nome', render: (item) => item.name },
          { header: 'Papel/vínculo', render: (item) => item.role },
        ]}
        editHref={(item) => `/admin/depoimentos/${item.id}`}
        itemLabel={(item) => item.name}
        onTogglePublished={toggleTestimonialPublished}
        onDelete={deleteTestimonial}
        emptyLabel="Nenhum depoimento cadastrado ainda."
      />
    </div>
  )
}
