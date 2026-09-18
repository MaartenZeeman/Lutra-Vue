export type QueryWaarde = string | number | boolean | null | undefined

/**
 * Builds a query string, skipping empty values so callers can pass optional filters directly.
 */
export function bouwQuery(params: Record<string, QueryWaarde>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    query.set(key, String(value))
  }

  const serialized = query.toString()
  return serialized.length > 0 ? `?${serialized}` : ''
}
