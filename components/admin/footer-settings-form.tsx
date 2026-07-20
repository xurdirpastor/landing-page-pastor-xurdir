'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { saveFooterSettings } from '@/lib/actions/footer-settings'
import type { FooterSettingsInput } from '@/lib/schemas/footer-settings'

type FooterSettingsFormProps = { initialValues: FooterSettingsInput }

const fields: Array<{ key: keyof FooterSettingsInput; label: string }> = [
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'address', label: 'Endereço' },
  { key: 'instagramUrl', label: 'Link do Instagram' },
  { key: 'youtubeUrl', label: 'Link do YouTube' },
  { key: 'whatsappUrl', label: 'Link do WhatsApp' },
  { key: 'copyrightText', label: 'Texto de copyright' },
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

  return (
    <Form onFormSubmit={() => handleSubmit()} className="flex max-w-xl flex-col gap-4">
      <ImageUploadField
        name="logoUrl"
        label="Logo do site (usado no cabeçalho e no rodapé)"
        section="profile"
        aspectRatio={1}
        value={values.logoUrl}
        onValueChange={(url) => setValues((v) => ({ ...v, logoUrl: url }))}
        error={fieldErrors.logoUrl?.[0]}
      />
      {fields.map(({ key, label }) => (
        <Field.Root key={key} name={key} invalid={!!fieldErrors[key]}>
          <Field.Label>{label}</Field.Label>
          <Field.Control
            render={<Input />}
            value={values[key]}
            onValueChange={(value) => setValues((v) => ({ ...v, [key]: value }))}
          />
          {fieldErrors[key] && <Field.Error>{fieldErrors[key][0]}</Field.Error>}
        </Field.Root>
      ))}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
