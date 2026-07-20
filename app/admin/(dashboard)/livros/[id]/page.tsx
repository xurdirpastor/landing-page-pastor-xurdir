import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminModalPage } from '@/components/admin/admin-modal-page'
import { BookForm } from '@/components/admin/book-form'

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.book.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <AdminModalPage title="Editar livro" backHref="/admin/livros">
      <BookForm
        id={item.id}
        initialValues={{
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          price: item.price.toString(),
          coverImageUrl: item.coverImageUrl,
          buyUrl: item.buyUrl,
          order: String(item.order),
        }}
      />
    </AdminModalPage>
  )
}
