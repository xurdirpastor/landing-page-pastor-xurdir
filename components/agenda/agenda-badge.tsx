import { Badge } from '@/components/ui/badge'
import type { AgendaType } from '@/lib/generated/prisma/client'

const LABELS: Record<AgendaType, string> = {
  presencial: 'Presencial',
  online: 'Online',
}

export function AgendaBadge({ type }: { type: AgendaType }) {
  return (
    <Badge variant={type} className="absolute top-4 left-4 uppercase">
      {LABELS[type]}
    </Badge>
  )
}
