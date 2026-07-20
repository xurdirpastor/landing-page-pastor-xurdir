'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { createAgendaItem, updateAgendaItem } from '@/lib/actions/agenda-item'
import type { AgendaItemInput } from '@/lib/schemas/agenda-item'

export type AgendaItemFormValues = Omit<AgendaItemInput, 'date'> & { date: string }

type AgendaItemFormProps = {
  id?: string
  initialValues: AgendaItemFormValues
}

export function AgendaItemForm({ id, initialValues }: AgendaItemFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = id ? await updateAgendaItem(id, values) : await createAgendaItem(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      toast.success('Item de agenda salvo com sucesso.')
      router.push('/admin/agenda')
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

      <Field.Root name="type" invalid={!!fieldErrors.type}>
        <Field.Label>Tipo</Field.Label>
        <Select
          name="type"
          value={values.type}
          onValueChange={(value) => {
            if (value) setValues((v) => ({ ...v, type: value as AgendaItemInput['type'] }))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="online">Online</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors.type && <Field.Error>{fieldErrors.type[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="date" invalid={!!fieldErrors.date}>
        <Field.Label>Data (ordenação e expiração automática, FR-7)</Field.Label>
        <Field.Control
          render={<Input type="date" />}
          value={values.date}
          onValueChange={(value) => setValues((v) => ({ ...v, date: value }))}
        />
        {fieldErrors.date && <Field.Error>{fieldErrors.date[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="dateLabel" invalid={!!fieldErrors.dateLabel}>
        <Field.Label>Data exibida (texto livre)</Field.Label>
        <Field.Control
          render={<Input placeholder="Qui, 17 de julho · 19h30" />}
          value={values.dateLabel}
          onValueChange={(value) => setValues((v) => ({ ...v, dateLabel: value }))}
        />
        {fieldErrors.dateLabel && <Field.Error>{fieldErrors.dateLabel[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="location" invalid={!!fieldErrors.location}>
        <Field.Label>Local</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.location}
          onValueChange={(value) => setValues((v) => ({ ...v, location: value }))}
        />
        {fieldErrors.location && <Field.Error>{fieldErrors.location[0]}</Field.Error>}
      </Field.Root>

      <ImageUploadField
        name="imageUrl"
        label="Foto"
        section="agenda"
        aspectRatio={4 / 3}
        value={values.imageUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, imageUrl: url }))}
        error={fieldErrors.imageUrl?.[0]}
      />

      <Field.Root name="linkUrl" invalid={!!fieldErrors.linkUrl}>
        <Field.Label>Link "Saiba mais"</Field.Label>
        <Field.Control
          render={<Input type="url" />}
          value={values.linkUrl}
          onValueChange={(value) => setValues((v) => ({ ...v, linkUrl: value }))}
        />
        {fieldErrors.linkUrl && <Field.Error>{fieldErrors.linkUrl[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="order" invalid={!!fieldErrors.order}>
        <Field.Label>Ordem de exibição</Field.Label>
        <Field.Control
          render={<Input type="number" />}
          value={String(values.order)}
          onValueChange={(value) => setValues((v) => ({ ...v, order: Number(value) }))}
        />
        {fieldErrors.order && <Field.Error>{fieldErrors.order[0]}</Field.Error>}
      </Field.Root>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
