import { describe, expect, it } from 'vitest'

import { bouwQuery } from './query'

describe('bouwQuery', () => {
  it('laat lege waarden weg', () => {
    expect(bouwQuery({ skip: 0, search: '', leeg: null, onbekend: undefined, take: 10 })).toBe(
      '?skip=0&take=10',
    )
  })

  it('codeert waarden voor gebruik in een URL', () => {
    expect(bouwQuery({ search: 'pasta pesto' })).toBe('?search=pasta+pesto')
  })

  it('geeft een lege string zonder parameters', () => {
    expect(bouwQuery({})).toBe('')
    expect(bouwQuery({ search: undefined })).toBe('')
  })
})
