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
import { saveHeroContent } from '@/lib/actions/hero'
import type { HeroInput } from '@/lib/schemas/hero'

type HeroFormProps = {
  initialValues: HeroInput
}

export function HeroForm({ initialValues }: HeroFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveHeroContent(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Hero salvo com sucesso.')
    })
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-2xl flex-col gap-6">
      <ImageUploadField
        name="heroPhotoUrl"
        label="Foto de destaque — desktop"
        section="profile"
        aspectRatio={16 / 9}
        value={values.heroPhotoUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, heroPhotoUrl: url }))}
      />

      <ImageUploadField
        name="heroPhotoMobileUrl"
        label="Foto de destaque — mobile (opcional, usa a de desktop se vazia)"
        section="profile"
        aspectRatio={4 / 5}
        value={values.heroPhotoMobileUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, heroPhotoMobileUrl: url }))}
      />

      <Field.Root name="heroHeadline" className="flex flex-col gap-1.5">
        <Field.Label>Headline (1ª linha)</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.heroHeadline}
          onValueChange={(value) => setValues((v) => ({ ...v, heroHeadline: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="heroHighlight" className="flex flex-col gap-1.5">
        <Field.Label>Headline manuscrita (2ª linha)</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.heroHighlight}
          onValueChange={(value) => setValues((v) => ({ ...v, heroHighlight: value }))}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="heroIntro" className="flex flex-col gap-1.5">
        <Field.Label>Texto de apresentação</Field.Label>
        <Field.Control
          render={<Textarea rows={4} />}
          value={values.heroIntro}
          onValueChange={(value) => setValues((v) => ({ ...v, heroIntro: value }))}
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
