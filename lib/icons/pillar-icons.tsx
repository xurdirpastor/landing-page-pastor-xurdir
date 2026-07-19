import { FileText, Clock, UserPlus, Sparkles, type LucideIcon } from 'lucide-react'

const PILLAR_ICONS: Record<string, LucideIcon> = {
  'file-text': FileText,
  clock: Clock,
  'user-plus': UserPlus,
}

export function getPillarIcon(slug: string): LucideIcon {
  return PILLAR_ICONS[slug] ?? Sparkles
}
