import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookForm } from '@/components/admin/book-form'

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.book.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Editar livro</h1>
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
    </div>
  )
}
