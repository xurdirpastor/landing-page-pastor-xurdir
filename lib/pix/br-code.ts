import { crc16ccitt } from './crc16'

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`
}

export function buildPixPayload(params: {
  key: string
  merchantName: string
  merchantCity: string
}): string {
  const merchantAccountInfo = emvField('00', 'br.gov.bcb.pix') + emvField('01', params.key)
  const additionalData = emvField('05', '***')

  const payloadWithoutCrc =
    emvField('00', '01') +
    emvField('26', merchantAccountInfo) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('58', 'BR') +
    emvField('59', params.merchantName.slice(0, 25).toUpperCase()) +
    emvField('60', params.merchantCity.slice(0, 15).toUpperCase()) +
    emvField('62', additionalData) +
    '6304'

  return payloadWithoutCrc + crc16ccitt(payloadWithoutCrc)
}
