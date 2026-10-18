import type {
  BeoordelingAanmaak,
  ImportResultaat,
  Verspakket,
  VerspakketAanmaak,
  VerspakketSamenvatting,
  VerspakketUpdate,
} from '@/shared/api/contract'
import { httpClient } from '@/shared/api/httpClient'
import { bouwQuery } from '@/shared/utils/query'

import type { Sorteerrichting, Sorteerveld } from '../model/verspakket'

export interface VerspakkettenQuery {
  skip?: number
  take?: number
  search?: string
  sortField?: Sorteerveld
  sortDirection?: Sorteerrichting
  signal?: AbortSignal
}

export interface VerspakkettenResultaat {
  verspakketten: VerspakketSamenvatting[]
}

export const verspakkettenApi = {
  list: ({ skip, take, search, sortField, sortDirection, signal }: VerspakkettenQuery = {}) =>
    httpClient.get<VerspakkettenResultaat>(
      `/verspakketten${bouwQuery({ skip, take, search, sortField, sortDirection })}`,
      { signal },
    ),

  getById: (id: string, signal?: AbortSignal) =>
    httpClient.get<{ verspakket: Verspakket }>(`/verspakketten/${encodeURIComponent(id)}`, {
      signal,
    }),

  create: (input: VerspakketAanmaak) => httpClient.post<{ id: string }>('/verspakketten', input),

  update: (id: string, input: VerspakketUpdate) =>
    httpClient.put<void>(`/verspakketten/${encodeURIComponent(id)}`, input),

  remove: (id: string) => httpClient.delete<void>(`/verspakketten/${encodeURIComponent(id)}`),

  addBeoordeling: (id: string, input: BeoordelingAanmaak) =>
    httpClient.post<{ id: string }>(
      `/verspakketten/${encodeURIComponent(id)}/beoordelingen`,
      input,
    ),

  updateBeoordeling: (id: string, beoordelingId: string, input: BeoordelingAanmaak) =>
    httpClient.put<void>(
      `/verspakketten/${encodeURIComponent(id)}/beoordelingen/${encodeURIComponent(beoordelingId)}`,
      input,
    ),

  removeBeoordeling: (id: string, beoordelingId: string) =>
    httpClient.delete<void>(
      `/verspakketten/${encodeURIComponent(id)}/beoordelingen/${encodeURIComponent(beoordelingId)}`,
    ),

  importFromUrl: (url: string) =>
    httpClient.post<ImportResultaat>('/verspakketten/import', { url }),
}
