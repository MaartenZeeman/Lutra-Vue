import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import { httpClient, setAccessTokenProvider } from '@/shared/api/httpClient'

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit]

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

function mockFetch(response: Response) {
  const fetchMock = vi.fn((..._args: FetchArgs) => Promise.resolve(response))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function firstCall(fetchMock: ReturnType<typeof mockFetch>) {
  const call = fetchMock.mock.calls[0]
  if (call === undefined) {
    throw new Error('fetch is niet aangeroepen.')
  }
  return call
}

afterEach(() => {
  setAccessTokenProvider(null)
  vi.unstubAllGlobals()
})

describe('httpClient', () => {
  it('prepends the api base path and parses a json response', async () => {
    const fetchMock = mockFetch(jsonResponse([{ id: '1' }]))

    const result = await httpClient.get<{ id: string }[]>('/verspakketten')

    const [url, init] = firstCall(fetchMock)
    expect(url).toBe('/api/verspakketten')
    expect(init?.method).toBe('GET')
    expect(result).toEqual([{ id: '1' }])
  })

  it('serializes a json body for write requests', async () => {
    const fetchMock = mockFetch(jsonResponse({ id: '1' }, { status: 201 }))

    await httpClient.post('/verspakketten', { naam: 'Test' })

    const [, init] = firstCall(fetchMock)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ naam: 'Test' }))
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('returns undefined for 204 responses', async () => {
    mockFetch(new Response(null, { status: 204 }))

    await expect(httpClient.delete('/verspakketten/1')).resolves.toBeUndefined()
  })

  it('returns undefined for empty response bodies', async () => {
    mockFetch(new Response('', { status: 200 }))

    await expect(httpClient.get('/verspakketten')).resolves.toBeUndefined()
  })

  it('throws an ApiError populated from problem details', async () => {
    mockFetch(
      new Response(JSON.stringify({ detail: 'Niet gevonden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/problem+json' },
      }),
    )

    const error: unknown = await httpClient
      .get('/verspakketten/1')
      .catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).message).toBe('Niet gevonden')
  })

  it('falls back to a generic message when the error body is not json', async () => {
    mockFetch(new Response('niet-json', { status: 500 }))

    const error: unknown = await httpClient.get('/verspakketten').catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(500)
    expect((error as ApiError).problem).toBeNull()
  })

  it('attaches a bearer token when a token provider is configured', async () => {
    const fetchMock = mockFetch(jsonResponse({}))
    setAccessTokenProvider(() => 'token-123')

    await httpClient.get('/verspakketten')

    const [, init] = firstCall(fetchMock)
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token-123')
  })

  it('omits the authorization header when no token is available', async () => {
    const fetchMock = mockFetch(jsonResponse({}))
    setAccessTokenProvider(() => null)

    await httpClient.get('/verspakketten')

    const [, init] = firstCall(fetchMock)
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('passes the abort signal through to fetch', async () => {
    const fetchMock = mockFetch(jsonResponse({}))
    const controller = new AbortController()

    await httpClient.get('/verspakketten', { signal: controller.signal })

    const [, init] = firstCall(fetchMock)
    expect(init?.signal).toBe(controller.signal)
  })
})
