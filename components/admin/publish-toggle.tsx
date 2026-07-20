'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import type { SimpleActionResult } from '@/lib/actions/types'

type PublishToggleProps = {
  id: string
  isPublished: boolean
  onToggle: (id: string, isPublished: boolean) => Promise<SimpleActionResult>
}

export function PublishToggle({ id, isPublished, onToggle }: PublishToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await onToggle(id, !isPublished)
      router.refresh()
    })
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className="cursor-pointer">
      <Badge variant={isPublished ? 'default' : 'outline'}>
        {isPublished ? 'Publicado' : 'Despublicado'}
      </Badge>
    </button>
  )
}
