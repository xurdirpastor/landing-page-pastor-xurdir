'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { saveAboutContent } from '@/lib/actions/pastor-profile'
import type { PastorProfileInput } from '@/lib/schemas/pastor-profile'

type AboutFormProps = {
  initialValues: PastorProfileInput
}

const PILLAR_ICON_OPTIONS = ['file-text', 'clock', 'user-plus'] as const

export function AboutForm({ initialValues }: AboutFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveAboutContent(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Conteúdo do Sobre salvo com sucesso.')
    })
  }

  function updatePillar(index: number, patch: Partial<PastorProfileInput['pillars'][number]>) {
    setValues((v) => ({
      ...v,
      pillars: v.pillars.map((pillar, i) => (i === index ? { ...pillar, ...patch } : pillar)),
    }))
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} className="flex max-w-2xl flex-col gap-4">
      <ImageUploadField
        name="heroPhotoUrl"
        label="Foto de destaque (hero)"
        section="profile"
        aspectRatio={16 / 9}
        value={values.heroPhotoUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, heroPhotoUrl: url }))}
        error={fieldErrors.heroPhotoUrl?.[0]}
      />

      <Field.Root name="heroHeadline" invalid={!!fieldErrors.heroHeadline}>
        <Field.Label>Headline (1ª linha)</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.heroHeadline}
          onValueChange={(value) => setValues((v) => ({ ...v, heroHeadline: value }))}
        />
        {fieldErrors.heroHeadline && <Field.Error>{fieldErrors.heroHeadline[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="heroHighlight" invalid={!!fieldErrors.heroHighlight}>
        <Field.Label>Headline manuscrita (2ª linha)</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.heroHighlight}
          onValueChange={(value) => setValues((v) => ({ ...v, heroHighlight: value }))}
        />
        {fieldErrors.heroHighlight && <Field.Error>{fieldErrors.heroHighlight[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="heroIntro" invalid={!!fieldErrors.heroIntro}>
        <Field.Label>Texto de apresentação</Field.Label>
        <Field.Control
          render={<Textarea rows={4} />}
          value={values.heroIntro}
          onValueChange={(value) => setValues((v) => ({ ...v, heroIntro: value }))}
        />
        {fieldErrors.heroIntro && <Field.Error>{fieldErrors.heroIntro[0]}</Field.Error>}
      </Field.Root>

      <ImageUploadField
        name="familyPhotoUrl"
        label="Foto da família"
        section="profile"
        aspectRatio={4 / 3}
        value={values.familyPhotoUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, familyPhotoUrl: url }))}
        error={fieldErrors.familyPhotoUrl?.[0]}
      />

      <Field.Root name="aboutEyebrow" invalid={!!fieldErrors.aboutEyebrow}>
        <Field.Label>Rótulo (eyebrow) de "Uma missão, três frentes"</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.aboutEyebrow}
          onValueChange={(value) => setValues((v) => ({ ...v, aboutEyebrow: value }))}
        />
        {fieldErrors.aboutEyebrow && <Field.Error>{fieldErrors.aboutEyebrow[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="aboutHeading" invalid={!!fieldErrors.aboutHeading}>
        <Field.Label>Título da seção</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.aboutHeading}
          onValueChange={(value) => setValues((v) => ({ ...v, aboutHeading: value }))}
        />
        {fieldErrors.aboutHeading && <Field.Error>{fieldErrors.aboutHeading[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="aboutIntro" invalid={!!fieldErrors.aboutIntro}>
        <Field.Label>Texto introdutório</Field.Label>
        <Field.Control
          render={<Textarea rows={3} />}
          value={values.aboutIntro}
          onValueChange={(value) => setValues((v) => ({ ...v, aboutIntro: value }))}
        />
        {fieldErrors.aboutIntro && <Field.Error>{fieldErrors.aboutIntro[0]}</Field.Error>}
      </Field.Root>

      <h2 className="font-heading text-lg font-semibold text-foreground">
        Os 3 pilares (ícone, título, descrição — sem adicionar/remover)
      </h2>
      {values.pillars.map((pillar, index) => (
        <fieldset key={pillar.id} className="flex flex-col gap-3 rounded-md border border-border p-4">
          <Field.Root
            name={`pillars.${index}.icon`}
            invalid={!!fieldErrors[`pillars.${index}.icon`]}
          >
            <Field.Label>Ícone</Field.Label>
            <Select
              name={`pillars.${index}.icon`}
              value={pillar.icon}
              onValueChange={(value) => {
                if (value) updatePillar(index, { icon: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PILLAR_ICON_OPTIONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors[`pillars.${index}.icon`] && (
              <Field.Error>{fieldErrors[`pillars.${index}.icon`][0]}</Field.Error>
            )}
          </Field.Root>
          <Field.Root
            name={`pillars.${index}.title`}
            invalid={!!fieldErrors[`pillars.${index}.title`]}
          >
            <Field.Label>Título</Field.Label>
            <Field.Control
              render={<Input />}
              value={pillar.title}
              onValueChange={(value) => updatePillar(index, { title: value })}
            />
            {fieldErrors[`pillars.${index}.title`] && (
              <Field.Error>{fieldErrors[`pillars.${index}.title`][0]}</Field.Error>
            )}
          </Field.Root>
          <Field.Root
            name={`pillars.${index}.description`}
            invalid={!!fieldErrors[`pillars.${index}.description`]}
          >
            <Field.Label>Descrição</Field.Label>
            <Field.Control
              render={<Textarea rows={2} />}
              value={pillar.description}
              onValueChange={(value) => updatePillar(index, { description: value })}
            />
            {fieldErrors[`pillars.${index}.description`] && (
              <Field.Error>{fieldErrors[`pillars.${index}.description`][0]}</Field.Error>
            )}
          </Field.Root>
        </fieldset>
      ))}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
