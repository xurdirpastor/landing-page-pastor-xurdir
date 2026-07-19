'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button onClick={handleCopy} size="sm" className="rounded-full">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  )
}
