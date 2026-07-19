import { describe, it, expect } from 'bun:test'
import { buildPixPayload } from './br-code'
import { crc16ccitt } from './crc16'

describe('buildPixPayload', () => {
  const payload = buildPixPayload({
    key: 'financeiro@example.org',
    merchantName: 'Ministerio Seja Livre',
    merchantCity: 'SAO PAULO',
  })

  it('starts with the fixed payload format indicator (tag 00, value "01")', () => {
    expect(payload.startsWith('000201')).toBe(true)
  })

  it('embeds the Pix key inside the merchant account info field', () => {
    expect(payload).toContain('financeiro@example.org')
  })

  it('embeds merchant name and city in upper case', () => {
    expect(payload).toContain('MINISTERIO SEJA LIVRE')
    expect(payload).toContain('SAO PAULO')
  })

  it('ends with a CRC16 that matches a recomputation over the rest of the payload', () => {
    const withoutCrc = payload.slice(0, -4)
    const crc = payload.slice(-4)
    expect(crc).toBe(crc16ccitt(withoutCrc))
  })
})
