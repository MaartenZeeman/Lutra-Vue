import { afterEach, describe, expect, it, vi } from 'vitest'

import { supermarktenApi } from './supermarktenApi'

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit]

function mockFetch(body: unknown = {}): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn((..._args: FetchArgs) =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function laatsteAanroep(fetchMock: ReturnType<typeof vi.fn>): FetchArgs {
  const call = fetchMock.mock.calls.at(-1) as FetchArgs | undefined
  if (call === undefined) {
    throw new Error('fetch is niet aangeroepen.')
  }
  return call
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('supermarktenApi', () => {
  it('gebruikt de juiste paden en methoden', async () => {
    const fetchMock = mockFetch({ supermarkten: [] })

    await supermarktenApi.list({ skip: 0, take: 50 })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/supermarkten?skip=0&take=50')

    await supermarktenApi.create({ naam: 'Jumbo' })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/supermarkten')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('POST')

    await supermarktenApi.update('s1', { naam: 'Jumbo XL' })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/supermarkten/s1')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('PUT')

    await supermarktenApi.remove('s1')
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/supermarkten/s1')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('DELETE')
  })
})
