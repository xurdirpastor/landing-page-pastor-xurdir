import { BookForm } from '@/components/admin/book-form'

export default function NewBookPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo livro</h1>
      <BookForm
        initialValues={{
          title: '',
          subtitle: '',
          description: '',
          price: '',
          coverImageUrl: '',
          buyUrl: '',
          order: '0',
        }}
      />
    </div>
  )
}
