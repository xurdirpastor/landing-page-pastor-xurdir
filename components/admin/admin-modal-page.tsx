'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type AdminModalPageProps = {
  title: string
  backHref: string
  children: React.ReactNode
}

export function AdminModalPage({ title, backHref, children }: AdminModalPageProps) {
  const router = useRouter()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push(backHref)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
