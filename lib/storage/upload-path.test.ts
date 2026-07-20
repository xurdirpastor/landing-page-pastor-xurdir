import { describe, expect, test } from 'bun:test'
import { buildUploadPath } from './upload-path'

describe('buildUploadPath', () => {
  test('combines section, id and a slugified filename', () => {
    expect(buildUploadPath('agenda', 'Foto do Culto.jpg', 'abc-123')).toBe(
      'agenda/abc-123-foto-do-culto.jpg'
    )
  })

  test('strips accents and collapses special characters', () => {
    expect(buildUploadPath('profile', 'Retrato do Pastor (2024)!.png', 'id-1')).toBe(
      'profile/id-1-retrato-do-pastor-2024-.png'
    )
  })
})
