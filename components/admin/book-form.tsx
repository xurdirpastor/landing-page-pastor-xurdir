'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { createBook, updateBook } from '@/lib/actions/book'
import type { BookInput } from '@/lib/schemas/book'

export type BookFormValues = Omit<BookInput, 'price' | 'order'> & { price: string; order: string }

type BookFormProps = {
  id?: string
  initialValues: BookFormValues
}

export function BookForm({ id, initialValues }: BookFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = id ? await updateBook(id, values) : await createBook(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      toast.success('Livro salvo com sucesso.')
      router.push('/admin/livros')
    })
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-xl flex-col gap-4">
      <Field.Root name="title" className="flex flex-col gap-1.5">
        <Field.Label>Título</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.title}
          onValueChange={(value) => setValues((v) => ({ ...v, title: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="subtitle" className="flex flex-col gap-1.5">
        <Field.Label>Subtítulo</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.subtitle}
          onValueChange={(value) => setValues((v) => ({ ...v, subtitle: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="description" className="flex flex-col gap-1.5">
        <Field.Label>Descrição</Field.Label>
        <Field.Control
          render={<Textarea rows={3} />}
          value={values.description}
          onValueChange={(value) => setValues((v) => ({ ...v, description: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="price" className="flex flex-col gap-1.5">
        <Field.Label>Preço (R$)</Field.Label>
        <Field.Control
          render={<Input type="number" step="0.01" />}
          value={values.price}
          onValueChange={(value) => setValues((v) => ({ ...v, price: value }))}
        />
        <Field.Error />
      </Field.Root>

      <ImageUploadField
        name="coverImageUrl"
        label="Capa"
        section="books"
        aspectRatio={11 / 16}
        value={values.coverImageUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, coverImageUrl: url }))}
      />

      <Field.Root name="buyUrl" className="flex flex-col gap-1.5">
        <Field.Label>Link "Comprar agora"</Field.Label>
        <Field.Control
          render={<Input type="url" />}
          value={values.buyUrl}
          onValueChange={(value) => setValues((v) => ({ ...v, buyUrl: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="order" className="flex flex-col gap-1.5">
        <Field.Label>Ordem de exibição</Field.Label>
        <Field.Control
          render={<Input type="number" />}
          value={values.order}
          onValueChange={(value) => setValues((v) => ({ ...v, order: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
