'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { FormSection } from '@/components/admin/form-section'
import { saveFooterSettings } from '@/lib/actions/footer-settings'
import type { FooterSettingsInput } from '@/lib/schemas/footer-settings'

type FooterSettingsFormProps = { initialValues: FooterSettingsInput }

const institutionalFields: Array<{ key: keyof FooterSettingsInput; label: string }> = [
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'address', label: 'Endereço' },
]

const socialFields: Array<{ key: keyof FooterSettingsInput; label: string }> = [
  { key: 'instagramUrl', label: 'Link do Instagram' },
  { key: 'youtubeUrl', label: 'Link do YouTube' },
  { key: 'whatsappUrl', label: 'Link do WhatsApp' },
]

export function FooterSettingsForm({ initialValues }: FooterSettingsFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveFooterSettings(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Rodapé salvo com sucesso.')
    })
  }

  function renderField({ key, label }: { key: keyof FooterSettingsInput; label: string }) {
    return (
      <Field.Root key={key} name={key} className="flex flex-col gap-1.5">
        <Field.Label>{label}</Field.Label>
        <Field.Control
          render={<Input />}
          value={values[key]}
          onValueChange={(value) => setValues((v) => ({ ...v, [key]: value }))}
        />
        <Field.Error />
      </Field.Root>
    )
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-xl flex-col gap-6">
      <FormSection title="Logo">
        <ImageUploadField
          name="logoUrl"
          label="Logo do site (usado no cabeçalho e no rodapé)"
          section="profile"
          aspectRatio={1}
          value={values.logoUrl}
          onValueChange={(url) => setValues((v) => ({ ...v, logoUrl: url }))}
        />
      </FormSection>

      <FormSection title="Dados institucionais">{institutionalFields.map(renderField)}</FormSection>

      <FormSection title="Redes sociais">{socialFields.map(renderField)}</FormSection>

      <FormSection title="Rodapé">
        <Field.Root name="copyrightText" className="flex flex-col gap-1.5">
          <Field.Label>Texto de copyright</Field.Label>
          <Field.Control
            render={<Input />}
            value={values.copyrightText}
            onValueChange={(value) => setValues((v) => ({ ...v, copyrightText: value }))}
          />
          <Field.Error />
        </Field.Root>
      </FormSection>

      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
