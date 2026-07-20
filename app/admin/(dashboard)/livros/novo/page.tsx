import { AdminModalPage } from '@/components/admin/admin-modal-page'
import { BookForm } from '@/components/admin/book-form'

export default function NewBookPage() {
  return (
    <AdminModalPage title="Novo livro" backHref="/admin/livros">
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
    </AdminModalPage>
  )
}
