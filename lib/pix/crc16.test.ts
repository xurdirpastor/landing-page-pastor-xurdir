import { describe, it, expect } from 'bun:test'
import { crc16ccitt } from './crc16'

describe('crc16ccitt', () => {
  it('matches the standard CRC-16/CCITT-FALSE check value for "123456789"', () => {
    expect(crc16ccitt('123456789')).toBe('29B1')
  })

  it('returns a 4-character uppercase hex string', () => {
    expect(crc16ccitt('abc')).toMatch(/^[0-9A-F]{4}$/)
  })
})
