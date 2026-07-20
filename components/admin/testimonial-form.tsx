'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { createTestimonial, updateTestimonial } from '@/lib/actions/testimonial'
import { AVATAR_COLORS, type TestimonialInput } from '@/lib/schemas/testimonial'

export type TestimonialFormValues = Omit<TestimonialInput, 'order'> & { order: string }

type TestimonialFormProps = {
  id?: string
  initialValues: TestimonialFormValues
}

export function TestimonialForm({ id, initialValues }: TestimonialFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = id
        ? await updateTestimonial(id, values)
        : await createTestimonial(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        toast.error('Corrija os campos destacados.')
        return
      }
      toast.success('Depoimento salvo com sucesso.')
      router.push('/admin/depoimentos')
    })
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} className="flex max-w-xl flex-col gap-4">
      <Field.Root name="quote" invalid={!!fieldErrors.quote} className="flex flex-col gap-1.5">
        <Field.Label>Depoimento</Field.Label>
        <Field.Control
          render={<Textarea rows={4} />}
          value={values.quote}
          onValueChange={(value) => setValues((v) => ({ ...v, quote: value }))}
        />
        {fieldErrors.quote && <Field.Error>{fieldErrors.quote[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="name" invalid={!!fieldErrors.name} className="flex flex-col gap-1.5">
        <Field.Label>Nome</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.name}
          onValueChange={(value) => setValues((v) => ({ ...v, name: value }))}
        />
        {fieldErrors.name && <Field.Error>{fieldErrors.name[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="role" invalid={!!fieldErrors.role} className="flex flex-col gap-1.5">
        <Field.Label>Papel/vínculo (ex.: "Membro desde 2021")</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.role}
          onValueChange={(value) => setValues((v) => ({ ...v, role: value }))}
        />
        {fieldErrors.role && <Field.Error>{fieldErrors.role[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="initials" invalid={!!fieldErrors.initials} className="flex flex-col gap-1.5">
        <Field.Label>Iniciais do avatar (máx. 3 caracteres)</Field.Label>
        <Field.Control
          render={<Input maxLength={3} />}
          value={values.initials}
          onValueChange={(value) => setValues((v) => ({ ...v, initials: value }))}
        />
        {fieldErrors.initials && <Field.Error>{fieldErrors.initials[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="avatarColor" invalid={!!fieldErrors.avatarColor} className="flex flex-col gap-1.5">
        <Field.Label>Cor do avatar</Field.Label>
        <Select
          name="avatarColor"
          value={values.avatarColor}
          onValueChange={(value) => {
            if (value) setValues((v) => ({ ...v, avatarColor: value as TestimonialInput['avatarColor'] }))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {AVATAR_COLORS.map((color) => (
              <SelectItem key={color} value={color}>
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.avatarColor && <Field.Error>{fieldErrors.avatarColor[0]}</Field.Error>}
      </Field.Root>

      <Field.Root name="order" invalid={!!fieldErrors.order} className="flex flex-col gap-1.5">
        <Field.Label>Ordem de exibição</Field.Label>
        <Field.Control
          render={<Input type="number" />}
          value={values.order}
          onValueChange={(value) => setValues((v) => ({ ...v, order: value }))}
        />
        {fieldErrors.order && <Field.Error>{fieldErrors.order[0]}</Field.Error>}
      </Field.Root>

      <Button type="submit" disabled={isPending}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </Form>
  )
}
