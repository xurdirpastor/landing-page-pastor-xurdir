'use client'

import { useState, useTransition } from 'react'
import { Form } from '@base-ui/react/form'
import { Field } from '@base-ui/react/field'
import { LuLoaderCircle } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from '@/lib/actions/auth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await signIn(email)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <p className="text-sm text-secondary-foreground">
        Se {email} estiver cadastrado como admin, um link de acesso foi enviado. Confira sua caixa
        de entrada.
      </p>
    )
  }

  return (
    <Form onFormSubmit={() => handleSubmit()} className="flex flex-col gap-4">
      <Field.Root name="email" invalid={!!error} className="flex flex-col gap-1.5">
        <Field.Label>E-mail</Field.Label>
        <Field.Control
          render={<Input type="email" placeholder="voce@exemplo.com" />}
          value={email}
          onValueChange={(value) => setEmail(value)}
        />
        {error && <Field.Error>{error}</Field.Error>}
      </Field.Root>
      <Button type="submit" disabled={isPending || email.length === 0}>
        {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
        {isPending ? 'Enviando...' : 'Enviar link de acesso'}
      </Button>
    </Form>
  )
}
