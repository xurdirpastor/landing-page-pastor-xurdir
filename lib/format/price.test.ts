import { describe, it, expect } from 'bun:test'
import { formatPriceBRL } from './price'

describe('formatPriceBRL', () => {
  it('formats a decimal string as BRL currency', () => {
    expect(formatPriceBRL('49.9')).toMatch(/^R\$\s?49,90$/)
  })

  it('formats a whole number without cent rounding errors', () => {
    expect(formatPriceBRL(120)).toMatch(/^R\$\s?120,00$/)
  })
})
