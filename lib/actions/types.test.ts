import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { zodIssuesToFieldErrors } from './types'

describe('zodIssuesToFieldErrors', () => {
  test('maps top-level field issues by field name', () => {
    const schema = z.object({ title: z.string().min(1, 'Obrigatório') })
    const result = schema.safeParse({ title: '' })
    if (result.success) throw new Error('expected failure')

    expect(zodIssuesToFieldErrors(result.error)).toEqual({
      title: ['Obrigatório'],
    })
  })

  test('maps nested array item issues by dotted path, unlike zod .flatten()', () => {
    const schema = z.object({
      pillars: z.array(z.object({ title: z.string().min(1, 'Obrigatório') })),
    })
    const result = schema.safeParse({ pillars: [{ title: 'ok' }, { title: '' }] })
    if (result.success) throw new Error('expected failure')

    expect(zodIssuesToFieldErrors(result.error)).toEqual({
      'pillars.1.title': ['Obrigatório'],
    })
  })
})
