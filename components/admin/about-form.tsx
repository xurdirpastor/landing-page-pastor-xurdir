'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
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
import { FormSection } from '@/components/admin/form-section'
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
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-2xl flex-col gap-6">
      <FormSection title="Hero" description="Primeira coisa que o visitante vê na home.">
        <ImageUploadField
          name="heroPhotoUrl"
          label="Foto de destaque (hero)"
          section="profile"
          aspectRatio={16 / 9}
          value={values.heroPhotoUrl}
          onValueChange={(url) => setValues((v) => ({ ...v, heroPhotoUrl: url }))}
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
      </FormSection>

      <FormSection title="Seção Sobre" description="Foto da família e texto de 'Uma missão, três frentes'.">
        <ImageUploadField
          name="familyPhotoUrl"
          label="Foto da família"
          section="profile"
          aspectRatio={4 / 3}
          value={values.familyPhotoUrl}
          onValueChange={(url) => setValues((v) => ({ ...v, familyPhotoUrl: url }))}
        />

        <Field.Root name="aboutEyebrow" className="flex flex-col gap-1.5">
          <Field.Label>Rótulo (eyebrow) de "Uma missão, três frentes"</Field.Label>
          <Field.Control
            render={<Input />}
            value={values.aboutEyebrow}
            onValueChange={(value) => setValues((v) => ({ ...v, aboutEyebrow: value }))}
          />
          <Field.Error />
        </Field.Root>

        <Field.Root name="aboutHeading" className="flex flex-col gap-1.5">
          <Field.Label>Título da seção</Field.Label>
          <Field.Control
            render={<Input />}
            value={values.aboutHeading}
            onValueChange={(value) => setValues((v) => ({ ...v, aboutHeading: value }))}
          />
          <Field.Error />
        </Field.Root>

        <Field.Root name="aboutIntro" className="flex flex-col gap-1.5">
          <Field.Label>Texto introdutório</Field.Label>
          <Field.Control
            render={<Textarea rows={3} />}
            value={values.aboutIntro}
            onValueChange={(value) => setValues((v) => ({ ...v, aboutIntro: value }))}
          />
          <Field.Error />
        </Field.Root>
      </FormSection>

      <FormSection
        title="Os 3 pilares"
        description="Ícone, título e descrição — sem adicionar/remover pilares."
      >
        {values.pillars.map((pillar, index) => (
          <fieldset key={pillar.id} className="flex flex-col gap-3 rounded-md border border-border p-4">
            <Field.Root
              name={`pillars.${index}.icon`}
              className="flex flex-col gap-1.5"
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
              <Field.Error />
            </Field.Root>
            <Field.Root
              name={`pillars.${index}.title`}
              className="flex flex-col gap-1.5"
            >
              <Field.Label>Título</Field.Label>
              <Field.Control
                render={<Input />}
                value={pillar.title}
                onValueChange={(value) => updatePillar(index, { title: value })}
              />
              <Field.Error />
            </Field.Root>
            <Field.Root
              name={`pillars.${index}.description`}
              className="flex flex-col gap-1.5"
            >
              <Field.Label>Descrição</Field.Label>
              <Field.Control
                render={<Textarea rows={2} />}
                value={pillar.description}
                onValueChange={(value) => updatePillar(index, { description: value })}
              />
              <Field.Error />
            </Field.Root>
          </fieldset>
        ))}
      </FormSection>

      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
