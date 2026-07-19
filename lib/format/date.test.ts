import { describe, it, expect } from 'bun:test'
import { isAgendaItemVisible, sortByOrder } from './date'

describe('isAgendaItemVisible', () => {
  const now = new Date('2026-07-19T12:00:00Z')

  it('is true when published and date is in the future', () => {
    expect(
      isAgendaItemVisible({ isPublished: true, date: new Date('2026-08-01') }, now),
    ).toBe(true)
  })

  it('is false when published but date already passed', () => {
    expect(
      isAgendaItemVisible({ isPublished: true, date: new Date('2026-01-01') }, now),
    ).toBe(false)
  })

  it('is false when unpublished even if date is in the future', () => {
    expect(
      isAgendaItemVisible({ isPublished: false, date: new Date('2026-08-01') }, now),
    ).toBe(false)
  })

  it('is false when unpublished and date already passed', () => {
    expect(
      isAgendaItemVisible({ isPublished: false, date: new Date('2026-01-01') }, now),
    ).toBe(false)
  })
})

describe('sortByOrder', () => {
  it('sorts ascending by the order field without mutating the input', () => {
    const input = [
      { order: 2, id: 'b' },
      { order: 0, id: 'a' },
      { order: 1, id: 'c' },
    ]
    const result = sortByOrder(input)
    expect(result.map((item) => item.id)).toEqual(['a', 'c', 'b'])
    expect(input.map((item) => item.id)).toEqual(['b', 'a', 'c'])
  })
})
