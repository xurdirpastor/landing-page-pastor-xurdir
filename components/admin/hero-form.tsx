'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle, LuPlus, LuTrash2 } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { FormSection } from '@/components/admin/form-section'
import { saveHeroContent } from '@/lib/actions/hero'
import type { HeroInput } from '@/lib/schemas/hero'

type HeroFormProps = {
  initialValues: HeroInput
}

const CTA_VARIANT_LABELS: Record<HeroInput['ctas'][number]['variant'], string> = {
  primary: 'Primário',
  secondary: 'Secundário',
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

  function updateCta(index: number, patch: Partial<HeroInput['ctas'][number]>) {
    setValues((v) => ({
      ...v,
      ctas: v.ctas.map((cta, i) => (i === index ? { ...cta, ...patch } : cta)),
    }))
  }

  function addCta() {
    if (values.ctas.length >= 2) return
    setValues((v) => ({
      ...v,
      ctas: [...v.ctas, { id: crypto.randomUUID(), label: '', href: '', variant: 'primary' }],
    }))
  }

  function removeCta(index: number) {
    setValues((v) => ({ ...v, ctas: v.ctas.filter((_, i) => i !== index) }))
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

      <Field.Root name="heroShowBadge" className="flex flex-row items-center justify-between gap-3">
        <Field.Label>Mostrar selo do ministério no Hero</Field.Label>
        <Switch
          checked={values.heroShowBadge}
          onCheckedChange={(checked) => setValues((v) => ({ ...v, heroShowBadge: checked }))}
        />
      </Field.Root>

      <FormSection
        title="Botões do Hero"
        description="Até 2 botões abaixo do texto — o nome do ministério vem da tela Header."
      >
        {values.ctas.map((cta, index) => (
          <fieldset
            key={cta.id}
            className="flex flex-col gap-3 rounded-md border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Botão {index + 1}</span>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeCta(index)}>
                <LuTrash2 className="size-4" />
                <span className="sr-only">Remover botão</span>
              </Button>
            </div>

            <Field.Root name={`ctas.${index}.label`} className="flex flex-col gap-1.5">
              <Field.Label>Texto</Field.Label>
              <Field.Control
                render={<Input />}
                value={cta.label}
                onValueChange={(value) => updateCta(index, { label: value })}
              />
              <Field.Error />
            </Field.Root>

            <Field.Root name={`ctas.${index}.href`} className="flex flex-col gap-1.5">
              <Field.Label>Link (ex.: #agenda ou https://...)</Field.Label>
              <Field.Control
                render={<Input />}
                value={cta.href}
                onValueChange={(value) => updateCta(index, { href: value })}
              />
              <Field.Error />
            </Field.Root>

            <Field.Root name={`ctas.${index}.variant`} className="flex flex-col gap-1.5">
              <Field.Label>Tipo</Field.Label>
              <Select
                name={`ctas.${index}.variant`}
                value={cta.variant}
                onValueChange={(value) => {
                  if (value) updateCta(index, { variant: value as HeroInput['ctas'][number]['variant'] })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CTA_VARIANT_LABELS) as Array<HeroInput['ctas'][number]['variant']>).map(
                    (variant) => (
                      <SelectItem key={variant} value={variant}>
                        {CTA_VARIANT_LABELS[variant]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Field.Error />
            </Field.Root>
          </fieldset>
        ))}

        {values.ctas.length < 2 && (
          <Button type="button" variant="outline" onClick={addCta} className="self-start">
            <LuPlus className="size-4" />
            Adicionar botão
          </Button>
        )}
      </FormSection>

      <Button type="submit" disabled={isPending} className="h-11">
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
