'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
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
    <Form onFormSubmit={() => handleSubmit()} className="flex max-w-xl flex-col gap-4">
      <Field.Root name="title" invalid={!!fieldErrors.title}>
        <Field.Label>Título</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.title}
          onValueChange={(value) => setValues((v) => ({ ...v, title: value }))}
        />
        {fieldErrors.title && <Field.Error>{fieldErrors.title[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="subtitle" invalid={!!fieldErrors.subtitle}>
        <Field.Label>Subtítulo</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.subtitle}
          onValueChange={(value) => setValues((v) => ({ ...v, subtitle: value }))}
        />
        {fieldErrors.subtitle && <Field.Error>{fieldErrors.subtitle[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="description" invalid={!!fieldErrors.description}>
        <Field.Label>Descrição</Field.Label>
        <Field.Control
          render={<Textarea rows={3} />}
          value={values.description}
          onValueChange={(value) => setValues((v) => ({ ...v, description: value }))}
        />
        {fieldErrors.description && <Field.Error>{fieldErrors.description[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="price" invalid={!!fieldErrors.price}>
        <Field.Label>Preço (R$)</Field.Label>
        <Field.Control
          render={<Input type="number" step="0.01" />}
          value={values.price}
          onValueChange={(value) => setValues((v) => ({ ...v, price: value }))}
        />
        {fieldErrors.price && <Field.Error>{fieldErrors.price[0]}</Field.Error>}
      </Field.Root>

      <ImageUploadField
        name="coverImageUrl"
        label="Capa"
        section="books"
        aspectRatio={11 / 16}
        value={values.coverImageUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, coverImageUrl: url }))}
        error={fieldErrors.coverImageUrl?.[0]}
      />

      <Field.Root name="buyUrl" invalid={!!fieldErrors.buyUrl}>
        <Field.Label>Link "Comprar agora"</Field.Label>
        <Field.Control
          render={<Input type="url" />}
          value={values.buyUrl}
          onValueChange={(value) => setValues((v) => ({ ...v, buyUrl: value }))}
        />
        {fieldErrors.buyUrl && <Field.Error>{fieldErrors.buyUrl[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="order" invalid={!!fieldErrors.order}>
        <Field.Label>Ordem de exibição</Field.Label>
        <Field.Control
          render={<Input type="number" />}
          value={values.order}
          onValueChange={(value) => setValues((v) => ({ ...v, order: value }))}
        />
        {fieldErrors.order && <Field.Error>{fieldErrors.order[0]}</Field.Error>}
      </Field.Root>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
