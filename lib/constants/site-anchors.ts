export const SITE_ANCHOR_VALUES = [
  '#hero',
  '#sobre',
  '#agenda',
  '#video',
  '#livros',
  '#depoimentos',
  '#ofertas',
] as const

export type SiteAnchor = (typeof SITE_ANCHOR_VALUES)[number]

export const SITE_ANCHOR_LABELS: Record<SiteAnchor, string> = {
  '#hero': 'Início (Hero)',
  '#sobre': 'Sobre',
  '#agenda': 'Agenda',
  '#video': 'Vídeo/Palavra',
  '#livros': 'Livros',
  '#depoimentos': 'Depoimentos',
  '#ofertas': 'Ofertas',
}
