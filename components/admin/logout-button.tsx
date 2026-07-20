'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      {isPending ? 'Saindo...' : 'Sair'}
    </Button>
  )
}
