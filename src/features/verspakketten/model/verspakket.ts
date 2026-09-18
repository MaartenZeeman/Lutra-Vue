export type {
  Beoordeling,
  BeoordelingAanmaak,
  FotoAanmaak,
  Ingredient,
  IngredientAanmaak,
  Verspakket,
  VerspakketAanmaak,
  VerspakketFoto,
  VerspakketSamenvatting,
  VerspakketUpdate,
  Voedingswaarde,
  VoedingswaardeAanmaak,
} from '@/shared/api/contract'

/** Wire values match `Lutra.Domain.Entities.Eenheid`. */
export const Eenheid = {
  Gram: 0,
  Kilogram: 1,
  Milliliter: 2,
  Liter: 3,
  Eetlepel: 4,
  Theelepel: 5,
  Aantal: 6,
} as const

export type Eenheid = (typeof Eenheid)[keyof typeof Eenheid]

export const EENHEID_LABELS: Record<number, string> = {
  [Eenheid.Gram]: 'gram',
  [Eenheid.Kilogram]: 'kilogram',
  [Eenheid.Milliliter]: 'milliliter',
  [Eenheid.Liter]: 'liter',
  [Eenheid.Eetlepel]: 'eetlepel',
  [Eenheid.Theelepel]: 'theelepel',
  [Eenheid.Aantal]: 'stuks',
}

export const EENHEDEN: Eenheid[] = Object.values(Eenheid)

/** Wire values match `Lutra.Domain.Entities.Allergeen` (the 14 EU-mandatory allergens). */
export const Allergeen = {
  Gluten: 0,
  Schaaldieren: 1,
  Eieren: 2,
  Vis: 3,
  Pinda: 4,
  Soja: 5,
  Melk: 6,
  Noten: 7,
  Selderij: 8,
  Mosterd: 9,
  Sesam: 10,
  Sulfieten: 11,
  Lupine: 12,
  Weekdieren: 13,
} as const

export type Allergeen = (typeof Allergeen)[keyof typeof Allergeen]

export const ALLERGEEN_LABELS: Record<number, string> = {
  [Allergeen.Gluten]: 'Gluten',
  [Allergeen.Schaaldieren]: 'Schaaldieren',
  [Allergeen.Eieren]: 'Eieren',
  [Allergeen.Vis]: 'Vis',
  [Allergeen.Pinda]: 'Pinda',
  [Allergeen.Soja]: 'Soja',
  [Allergeen.Melk]: 'Melk',
  [Allergeen.Noten]: 'Noten',
  [Allergeen.Selderij]: 'Selderij',
  [Allergeen.Mosterd]: 'Mosterd',
  [Allergeen.Sesam]: 'Sesam',
  [Allergeen.Sulfieten]: 'Sulfieten',
  [Allergeen.Lupine]: 'Lupine',
  [Allergeen.Weekdieren]: 'Weekdieren',
}

export const ALLERGENEN: Allergeen[] = Object.values(Allergeen)

export const VoedingswaardeBasis = {
  Per100Gram: 0,
  PerPortie: 1,
} as const

export type VoedingswaardeBasis = (typeof VoedingswaardeBasis)[keyof typeof VoedingswaardeBasis]

export const VOEDINGSWAARDE_BASIS_LABELS: Record<number, string> = {
  [VoedingswaardeBasis.Per100Gram]: 'Per 100 gram',
  [VoedingswaardeBasis.PerPortie]: 'Per portie',
}

/** Wire values match `Lutra.Application.Verspakketten.VerspakketSortField`. */
export const Sorteerveld = {
  Naam: 0,
  Prijs: 1,
  Smaak: 2,
  Bereiden: 3,
} as const

export type Sorteerveld = (typeof Sorteerveld)[keyof typeof Sorteerveld]

/** Wire values match `Lutra.Application.Verspakketten.SortDirection`. */
export const Sorteerrichting = {
  Oplopend: 0,
  Aflopend: 1,
} as const

export type Sorteerrichting = (typeof Sorteerrichting)[keyof typeof Sorteerrichting]

export interface Sorteeroptie {
  veld: Sorteerveld
  richting: Sorteerrichting
  label: string
}

/** Default ordering: best rated on taste first, which drives the homepage top 10. */
export const STANDAARD_SORTERING: Sorteeroptie = {
  veld: Sorteerveld.Smaak,
  richting: Sorteerrichting.Aflopend,
  label: 'Beste smaakscore',
}

export const SORTEEROPTIES: Sorteeroptie[] = [
  STANDAARD_SORTERING,
  { veld: Sorteerveld.Smaak, richting: Sorteerrichting.Oplopend, label: 'Laagste smaakscore' },
  {
    veld: Sorteerveld.Bereiden,
    richting: Sorteerrichting.Aflopend,
    label: 'Makkelijkst te bereiden',
  },
  {
    veld: Sorteerveld.Bereiden,
    richting: Sorteerrichting.Oplopend,
    label: 'Moeilijkst te bereiden',
  },
  { veld: Sorteerveld.Prijs, richting: Sorteerrichting.Oplopend, label: 'Prijs: laag naar hoog' },
  { veld: Sorteerveld.Prijs, richting: Sorteerrichting.Aflopend, label: 'Prijs: hoog naar laag' },
  { veld: Sorteerveld.Naam, richting: Sorteerrichting.Oplopend, label: 'Naam: A tot Z' },
  { veld: Sorteerveld.Naam, richting: Sorteerrichting.Aflopend, label: 'Naam: Z tot A' },
]

export function sorteeroptieSleutel(veld: number, richting: number): string {
  return `${veld}-${richting}`
}

export function zoekSorteeroptie(veld: number, richting: number): Sorteeroptie {
  return (
    SORTEEROPTIES.find((optie) => optie.veld === veld && optie.richting === richting) ??
    STANDAARD_SORTERING
  )
}
