export const supermarkt = {
  id: '11111111-1111-1111-1111-111111111111',
  naam: 'Jumbo',
}

export interface SamenvattingOpties {
  prijsInCenten?: number | null
  averageCijferSmaak?: number | null
  averageCijferBereiden?: number | null
}

export function samenvatting(id: string, naam: string, opties: SamenvattingOpties = {}) {
  return {
    id,
    naam,
    prijsInCenten: 749,
    aantalPersonen: 4,
    averageCijferSmaak: 8.5,
    averageCijferBereiden: 7.2,
    foto: null,
    supermarkt,
    ...opties,
  }
}

export function verspakketDetail(naam = 'Jumbo Satépannetje') {
  return {
    verspakket: {
      id: supermarkt.id,
      naam,
      prijsInCenten: 749,
      aantalPersonen: 4,
      averageCijferSmaak: 8.5,
      averageCijferBereiden: 7.2,
      beoordelingen: [
        { cijferSmaak: 9, cijferBereiden: 8, aanbevolen: true, tekst: 'Heerlijk met de kinderen.' },
      ],
      fotos: [],
      ingredienten: [{ naam: 'Kipfilet', hoeveelheid: 300, eenheid: 0, inbegrepen: true }],
      voedingswaarden: [],
      allergenen: [0, 6],
      supermarkt,
    },
  }
}
