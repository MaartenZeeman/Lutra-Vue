import { ApiError } from '@/shared/api/apiError'

const API_BASE_PATH = '/api'

export interface RequestOptions {
  signal?: AbortSignal
  headers?: Record<string, string>
}

export interface BodyRequestOptions extends RequestOptions {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

type AccessTokenProvider = () => string | null | Promise<string | null>

let accessTokenProvider: AccessTokenProvider | null = null

export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  accessTokenProvider = provider
}

async function resolveAuthorizationHeader(): Promise<Record<string, string>> {
  if (accessTokenProvider === null) {
    return {}
  }

  const token = await accessTokenProvider()
  return token === null || token.length === 0 ? {} : { Authorization: `Bearer ${token}` }
}

async function request<T>(path: string, options: BodyRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, headers } = options
  const hasBody = body !== undefined
  const authorization = await resolveAuthorizationHeader()

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...authorization,
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (text.length === 0) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
