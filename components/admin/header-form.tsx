'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { LuLoaderCircle, LuPlus, LuTrash2 } from 'react-icons/lu'
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
import { saveHeaderSettings } from '@/lib/actions/header'
import type { HeaderInput } from '@/lib/schemas/header'
import { SITE_ANCHOR_VALUES, SITE_ANCHOR_LABELS } from '@/lib/constants/site-anchors'

type HeaderFormProps = {
  initialValues: HeaderInput
}

export function HeaderForm({ initialValues }: HeaderFormProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await saveHeaderSettings(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      setFieldErrors({})
      toast.success('Header salvo com sucesso.')
    })
  }

  function updateNavLink(index: number, patch: Partial<HeaderInput['navLinks'][number]>) {
    setValues((v) => ({
      ...v,
      navLinks: v.navLinks.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    }))
  }

  function addNavLink() {
    setValues((v) => ({
      ...v,
      navLinks: [...v.navLinks, { id: crypto.randomUUID(), label: '', href: SITE_ANCHOR_VALUES[0] }],
    }))
  }

  function removeNavLink(index: number) {
    setValues((v) => ({ ...v, navLinks: v.navLinks.filter((_, i) => i !== index) }))
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} errors={fieldErrors} className="flex max-w-2xl flex-col gap-6">
      <FormSection title="Identidade" description="Nome usado no navbar, rodapé e selo do Hero.">
        <Field.Root name="ministryName" className="flex flex-col gap-1.5">
          <Field.Label>Nome do ministério</Field.Label>
          <Field.Control
            render={<Input />}
            value={values.ministryName}
            onValueChange={(value) => setValues((v) => ({ ...v, ministryName: value }))}
          />
          <Field.Error />
        </Field.Root>
      </FormSection>

      <FormSection title="Botão de contato" description="CTA fixo no canto direito do navbar.">
        <Field.Root name="ctaLabel" className="flex flex-col gap-1.5">
          <Field.Label>Texto do botão</Field.Label>
          <Field.Control
            render={<Input />}
            value={values.ctaLabel}
            onValueChange={(value) => setValues((v) => ({ ...v, ctaLabel: value }))}
          />
          <Field.Error />
        </Field.Root>

        <Field.Root name="ctaHref" className="flex flex-col gap-1.5">
          <Field.Label>Destino</Field.Label>
          <Select
            name="ctaHref"
            value={values.ctaHref}
            onValueChange={(value) => {
              if (value) setValues((v) => ({ ...v, ctaHref: value as HeaderInput['ctaHref'] }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SITE_ANCHOR_VALUES.map((anchor) => (
                <SelectItem key={anchor} value={anchor}>
                  {SITE_ANCHOR_LABELS[anchor]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Field.Error />
        </Field.Root>
      </FormSection>

      <FormSection title="Atalhos do menu" description="Links exibidos no navbar e no menu mobile.">
        {values.navLinks.map((link, index) => (
          <fieldset
            key={link.id}
            className="flex flex-col gap-3 rounded-md border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Atalho {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeNavLink(index)}
              >
                <LuTrash2 className="size-4" />
                <span className="sr-only">Remover atalho</span>
              </Button>
            </div>

            <Field.Root name={`navLinks.${index}.label`} className="flex flex-col gap-1.5">
              <Field.Label>Texto exibido</Field.Label>
              <Field.Control
                render={<Input />}
                value={link.label}
                onValueChange={(value) => updateNavLink(index, { label: value })}
              />
              <Field.Error />
            </Field.Root>

            <Field.Root name={`navLinks.${index}.href`} className="flex flex-col gap-1.5">
              <Field.Label>Seção</Field.Label>
              <Select
                name={`navLinks.${index}.href`}
                value={link.href}
                onValueChange={(value) => {
                  if (value) updateNavLink(index, { href: value as HeaderInput['ctaHref'] })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SITE_ANCHOR_VALUES.map((anchor) => (
                    <SelectItem key={anchor} value={anchor}>
                      {SITE_ANCHOR_LABELS[anchor]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Field.Error />
            </Field.Root>
          </fieldset>
        ))}

        <Button type="button" variant="outline" onClick={addNavLink} className="self-start">
          <LuPlus className="size-4" />
          Adicionar atalho
        </Button>
      </FormSection>

      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
