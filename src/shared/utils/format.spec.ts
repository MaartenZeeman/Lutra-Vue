import { describe, expect, it } from 'vitest'

import { formatGetal, formatPersonen, formatPrijs, formatScore } from './format'

describe('formatPrijs', () => {
  it('formatteert centen als eurobedrag', () => {
    expect(formatPrijs(749)).toContain('7,49')
  })

  it('geeft een melding wanneer de prijs ontbreekt', () => {
    expect(formatPrijs(null)).toBe('Prijs onbekend')
    expect(formatPrijs(undefined)).toBe('Prijs onbekend')
  })
})

describe('formatScore', () => {
  it('formatteert met één decimaal en een komma', () => {
    expect(formatScore(7)).toBe('7,0')
    expect(formatScore(8.5)).toBe('8,5')
  })

  it('geeft null wanneer er geen score is', () => {
    expect(formatScore(null)).toBeNull()
  })
})

describe('formatGetal', () => {
  it('formatteert getallen met een komma en maximaal twee decimalen', () => {
    expect(formatGetal(4.25)).toBe('4,25')
    expect(formatGetal(14)).toBe('14')
  })

  it('toont een streepje voor ontbrekende waarden', () => {
    expect(formatGetal(null)).toBe('–')
  })
})

describe('formatPersonen', () => {
  it('gebruikt het enkelvoud voor één persoon', () => {
    expect(formatPersonen(1)).toBe('1 persoon')
  })

  it('gebruikt het meervoud voor meerdere personen', () => {
    expect(formatPersonen(4)).toBe('4 personen')
  })

  it('valt terug op een melding zonder aantal', () => {
    expect(formatPersonen(null)).toBe('Onbekend aantal personen')
  })
})
