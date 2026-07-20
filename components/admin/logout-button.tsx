'use client'

import { useTransition } from 'react'
import { LuLoaderCircle } from 'react-icons/lu'
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
      {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
      {isPending ? 'Saindo...' : 'Sair'}
    </Button>
  )
}
