const prijsFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
})

const scoreFormatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const getalFormatter = new Intl.NumberFormat('nl-NL', {
  maximumFractionDigits: 2,
})

export function formatPrijs(centen: number | null | undefined): string {
  if (centen === null || centen === undefined) {
    return 'Prijs onbekend'
  }

  return prijsFormatter.format(centen / 100)
}

export function formatScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined) {
    return null
  }

  return scoreFormatter.format(score)
}

export function formatGetal(waarde: number | null | undefined): string {
  if (waarde === null || waarde === undefined) {
    return '–'
  }

  return getalFormatter.format(waarde)
}

export function formatPersonen(aantal: number | null | undefined): string {
  if (aantal === null || aantal === undefined) {
    return 'Onbekend aantal personen'
  }

  return aantal === 1 ? '1 persoon' : `${aantal} personen`
}
