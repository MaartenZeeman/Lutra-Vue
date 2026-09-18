import { describe, expect, it } from 'vitest'

import {
  SORTEEROPTIES,
  STANDAARD_SORTERING,
  Sorteerrichting,
  Sorteerveld,
  sorteeroptieSleutel,
  zoekSorteeroptie,
} from './verspakket'

describe('sorteeropties', () => {
  it('bouwt een sleutel uit veld en richting', () => {
    expect(sorteeroptieSleutel(Sorteerveld.Smaak, Sorteerrichting.Aflopend)).toBe('2-1')
  })

  it('vindt de optie die bij de sleutel hoort', () => {
    expect(zoekSorteeroptie(Sorteerveld.Prijs, Sorteerrichting.Oplopend).label).toBe(
      'Prijs: laag naar hoog',
    )
  })

  it('valt terug op de standaardsortering bij een onbekende combinatie', () => {
    expect(zoekSorteeroptie(99, 99)).toBe(STANDAARD_SORTERING)
  })

  it('bevat unieke sleutels', () => {
    const sleutels = SORTEEROPTIES.map((optie) => sorteeroptieSleutel(optie.veld, optie.richting))

    expect(new Set(sleutels).size).toBe(sleutels.length)
  })
})
