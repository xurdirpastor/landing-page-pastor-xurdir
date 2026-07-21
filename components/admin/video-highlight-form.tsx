'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { saveVideoHighlight } from '@/lib/actions/video-highlight'
import type { VideoHighlightInput } from '@/lib/schemas/video-highlight'

type VideoHighlightFormProps = { initialValues: VideoHighlightInput }

export function VideoHighlightForm({ initialValues }: VideoHighlightFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveVideoHighlight(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Vídeo em destaque salvo com sucesso.')
    })
  }

  const fields: Array<{
    key: keyof VideoHighlightInput
    label: string
    multiline?: boolean
  }> = [
    { key: 'eyebrow', label: 'Rótulo (eyebrow)' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição curta', multiline: true },
    { key: 'videoUrl', label: 'Link do vídeo (ex.: YouTube)' },
    { key: 'durationLabel', label: 'Duração exibida (ex.: "42 min")' },
    { key: 'ctaLabel', label: 'Texto do botão' },
  ]

  return (
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-xl flex-col gap-4">
      <ImageUploadField
        name="thumbnailUrl"
        label="Thumbnail"
        section="video"
        aspectRatio={16 / 9}
        value={values.thumbnailUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, thumbnailUrl: url }))}
      />
      {fields.map(({ key, label, multiline }) => (
        <Field.Root key={key} name={key} className="flex flex-col gap-1.5">
          <Field.Label>{label}</Field.Label>
          <Field.Control
            render={multiline ? <Textarea rows={3} /> : <Input />}
            value={values[key]}
            onValueChange={(value) => setValues((v) => ({ ...v, [key]: value }))}
          />
          <Field.Error />
        </Field.Root>
      ))}
      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
