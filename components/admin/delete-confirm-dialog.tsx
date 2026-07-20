'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LuLoaderCircle } from 'react-icons/lu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { SimpleActionResult } from '@/lib/actions/types'

type DeleteConfirmDialogProps = {
  itemLabel: string
  onConfirm: () => Promise<SimpleActionResult>
}

export function DeleteConfirmDialog({ itemLabel, onConfirm }: DeleteConfirmDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm()
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setOpen(false)
      toast.success('Removido com sucesso.')
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Excluir</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir {itemLabel}?</DialogTitle>
          <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {isPending && <LuLoaderCircle className="size-4 animate-spin" />}
            {isPending ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
