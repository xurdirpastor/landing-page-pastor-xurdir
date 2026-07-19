export function isAgendaItemVisible(
  item: { isPublished: boolean; date: Date },
  now: Date,
): boolean {
  return item.isPublished && item.date.getTime() >= now.getTime()
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}
