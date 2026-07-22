'use client'

import { useState, useTransition } from 'react'
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
import { FormSection } from '@/components/admin/form-section'
import { saveOfferingSettings } from '@/lib/actions/offering-settings'
import type { OfferingSettingsInput } from '@/lib/schemas/offering-settings'

type OfferingSettingsFormProps = { initialValues: OfferingSettingsInput }

const pixKeyTypeLabels: Record<OfferingSettingsInput['pixKeyType'], string> = {
  email: 'E-mail',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  phone: 'Telefone',
  random: 'Chave aleatória',
}

const pixFields: Array<{ key: keyof OfferingSettingsInput; label: string }> = [
  { key: 'pixKey', label: 'Chave Pix' },
  { key: 'pixMerchantName', label: 'Nome do beneficiário' },
  { key: 'pixMerchantCity', label: 'Cidade do beneficiário' },
]

const nationalFields: Array<{ key: keyof OfferingSettingsInput; label: string }> = [
  { key: 'nationalBank', label: 'Banco' },
  { key: 'nationalAgency', label: 'Agência' },
  { key: 'nationalAccount', label: 'Conta corrente' },
  { key: 'nationalCnpj', label: 'CNPJ' },
]

const intlFields: Array<{ key: keyof OfferingSettingsInput; label: string }> = [
  { key: 'intlBank', label: 'Banco' },
  { key: 'intlIban', label: 'IBAN' },
  { key: 'intlSwift', label: 'SWIFT/BIC' },
  { key: 'intlAccountHolder', label: 'Titular' },
]

export function OfferingSettingsForm({ initialValues }: OfferingSettingsFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveOfferingSettings(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Dados de ofertas salvos com sucesso.')
    })
  }

  function renderField({ key, label }: { key: keyof OfferingSettingsInput; label: string }) {
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
      <FormSection title="Pix">
        <Field.Root name="pixKeyType" className="flex flex-col gap-1.5">
          <Field.Label>Tipo da chave Pix</Field.Label>
          <Select
            name="pixKeyType"
            value={values.pixKeyType}
            onValueChange={(value) => {
              if (value) setValues((v) => ({ ...v, pixKeyType: value as OfferingSettingsInput['pixKeyType'] }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(pixKeyTypeLabels) as Array<OfferingSettingsInput['pixKeyType']>).map(
                (type) => (
                  <SelectItem key={type} value={type}>
                    {pixKeyTypeLabels[type]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Field.Error />
        </Field.Root>
        {pixFields.map(renderField)}
      </FormSection>

      <FormSection title="Conta nacional">{nationalFields.map(renderField)}</FormSection>

      <FormSection title="Conta internacional">{intlFields.map(renderField)}</FormSection>

      <Button type="submit" disabled={isPending} className="h-11">
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
