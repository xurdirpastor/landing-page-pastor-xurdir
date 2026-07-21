'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
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

      <Field.Root name="type" className="flex flex-col gap-1.5">
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
        <Field.Error />
      </Field.Root>

      <Field.Root name="date" className="flex flex-col gap-1.5">
        <Field.Label>Data (ordenação e expiração automática, FR-7)</Field.Label>
        <Field.Control
          render={<Input type="date" />}
          value={values.date}
          onValueChange={(value) => setValues((v) => ({ ...v, date: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="dateLabel" className="flex flex-col gap-1.5">
        <Field.Label>Data exibida (texto livre)</Field.Label>
        <Field.Control
          render={<Input placeholder="Qui, 17 de julho · 19h30" />}
          value={values.dateLabel}
          onValueChange={(value) => setValues((v) => ({ ...v, dateLabel: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="location" className="flex flex-col gap-1.5">
        <Field.Label>Local</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.location}
          onValueChange={(value) => setValues((v) => ({ ...v, location: value }))}
        />
        <Field.Error />
      </Field.Root>

      <ImageUploadField
        name="imageUrl"
        label="Foto"
        section="agenda"
        aspectRatio={4 / 3}
        value={values.imageUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, imageUrl: url }))}
      />

      <Field.Root name="linkUrl" className="flex flex-col gap-1.5">
        <Field.Label>Link "Saiba mais"</Field.Label>
        <Field.Control
          render={<Input type="url" />}
          value={values.linkUrl}
          onValueChange={(value) => setValues((v) => ({ ...v, linkUrl: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="order" className="flex flex-col gap-1.5">
        <Field.Label>Ordem de exibição</Field.Label>
        <Field.Control
          render={<Input type="number" />}
          value={String(values.order)}
          onValueChange={(value) => setValues((v) => ({ ...v, order: Number(value) }))}
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
