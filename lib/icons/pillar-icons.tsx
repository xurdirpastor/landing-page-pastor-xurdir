import { LuFileText, LuClock, LuUserPlus, LuSparkles } from 'react-icons/lu'
import type { IconType } from 'react-icons'

const PILLAR_ICONS: Record<string, IconType> = {
  'file-text': LuFileText,
  clock: LuClock,
  'user-plus': LuUserPlus,
}

export function getPillarIcon(slug: string): IconType {
  return PILLAR_ICONS[slug] ?? LuSparkles
}
