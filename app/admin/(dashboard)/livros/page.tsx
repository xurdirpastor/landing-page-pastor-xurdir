import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { EntityTable } from '@/components/admin/entity-table'
import { deleteBook, toggleBookPublished } from '@/lib/actions/book'
import { formatPriceBRL } from '@/lib/format/price'

export default async function BooksListPage() {
  const items = await prisma.book.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Livros</h1>
        <Button render={<Link href="/admin/livros/novo" />} nativeButton={false}>
          Novo livro
        </Button>
      </div>
      <EntityTable
        items={items}
        columns={[
          { header: 'Título', render: (item) => item.title },
          { header: 'Preço', render: (item) => formatPriceBRL(item.price.toString()) },
        ]}
        editHref={(item) => `/admin/livros/${item.id}`}
        itemLabel={(item) => item.title}
        onTogglePublished={toggleBookPublished}
        onDelete={deleteBook}
        emptyLabel="Nenhum livro cadastrado ainda."
      />
    </div>
  )
}
