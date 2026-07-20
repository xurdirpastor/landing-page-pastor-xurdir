'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addAdmin } from '@/lib/actions/admin'

export function AddAdminForm() {
  const router = useRouter()
  const [values, setValues] = useState({ email: '', name: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await addAdmin(values)
      if (!result.success) {
        setFieldErrors(result.fieldErrors)
        return
      }
      setValues({ email: '', name: '' })
      setFieldErrors({})
      toast.success('Admin adicionado com sucesso.')
      router.refresh()
    })
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} className="flex max-w-md flex-col gap-4">
      <Field.Root name="email" invalid={!!fieldErrors.email}>
        <Field.Label>E-mail</Field.Label>
        <Field.Control
          render={<Input type="email" />}
          value={values.email}
          onValueChange={(value) => setValues((v) => ({ ...v, email: value }))}
        />
        {fieldErrors.email && <Field.Error>{fieldErrors.email[0]}</Field.Error>}
      </Field.Root>
      <Field.Root name="name" invalid={!!fieldErrors.name}>
        <Field.Label>Nome</Field.Label>
        <Field.Control
          render={<Input />}
          value={values.name}
          onValueChange={(value) => setValues((v) => ({ ...v, name: value }))}
        />
        {fieldErrors.name && <Field.Error>{fieldErrors.name[0]}</Field.Error>}
      </Field.Root>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Adicionando...' : 'Adicionar admin'}
      </Button>
    </Form>
  )
}
