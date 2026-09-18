import type { BackgroundCommand } from '@/shared/api/contract'
import { httpClient } from '@/shared/api/httpClient'

export const backgroundCommandsApi = {
  getById: (id: string, signal?: AbortSignal) =>
    httpClient.get<BackgroundCommand>(`/background-commands/${encodeURIComponent(id)}`, { signal }),
}
