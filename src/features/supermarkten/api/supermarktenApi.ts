import type { Supermarkt, SupermarktAanmaak } from '@/shared/api/contract'
import { httpClient } from '@/shared/api/httpClient'
import { bouwQuery } from '@/shared/utils/query'

export interface SupermarktenQuery {
  skip?: number
  take?: number
  signal?: AbortSignal
}

export interface SupermarktenResultaat {
  supermarkten: Supermarkt[]
}

export const supermarktenApi = {
  list: ({ skip, take, signal }: SupermarktenQuery = {}) =>
    httpClient.get<SupermarktenResultaat>(`/supermarkten${bouwQuery({ skip, take })}`, { signal }),

  create: (input: SupermarktAanmaak) => httpClient.post<{ id: string }>('/supermarkten', input),

  update: (id: string, input: SupermarktAanmaak) =>
    httpClient.put<void>(`/supermarkten/${encodeURIComponent(id)}`, input),
}
