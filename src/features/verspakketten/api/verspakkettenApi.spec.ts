import { afterEach, describe, expect, it, vi } from 'vitest'

import { verspakkettenApi } from './verspakkettenApi'

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

function eersteAanroep(fetchMock: ReturnType<typeof vi.fn>): FetchArgs {
  const call = fetchMock.mock.calls[0] as FetchArgs | undefined
  if (call === undefined) {
    throw new Error('fetch is niet aangeroepen.')
  }
  return call
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

describe('verspakkettenApi.list', () => {
  it('serialiseert alle zoek- en sorteerparameters', async () => {
    const fetchMock = mockFetch({ verspakketten: [] })

    await verspakkettenApi.list({
      skip: 0,
      take: 10,
      search: 'pasta',
      sortField: 2,
      sortDirection: 1,
    })

    const [url] = eersteAanroep(fetchMock)
    expect(url).toBe('/api/verspakketten?skip=0&take=10&search=pasta&sortField=2&sortDirection=1')
  })

  it('laat optionele parameters weg', async () => {
    const fetchMock = mockFetch({ verspakketten: [] })

    await verspakkettenApi.list()

    const [url] = eersteAanroep(fetchMock)
    expect(url).toBe('/api/verspakketten')
  })
})

describe('verspakkettenApi endpoints', () => {
  it('gebruikt de juiste paden en methoden', async () => {
    const fetchMock = mockFetch({ id: 'abc' })

    await verspakkettenApi.getById('abc')
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc')

    await verspakkettenApi.create({
      naam: 'Test',
      prijsInCenten: 100,
      aantalPersonen: 2,
      supermarktId: 's1',
    })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('POST')

    await verspakkettenApi.update('abc', {
      naam: 'Test',
      prijsInCenten: 100,
      aantalPersonen: 2,
      supermarktId: 's1',
    })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('PUT')

    await verspakkettenApi.remove('abc')
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('DELETE')

    await verspakkettenApi.addBeoordeling('abc', {
      cijferSmaak: 8,
      cijferBereiden: 7,
      aanbevolen: true,
      tekst: null,
    })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc/beoordelingen')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('POST')

    await verspakkettenApi.updateBeoordeling('abc', 'b1', {
      cijferSmaak: 8,
      cijferBereiden: 7,
      aanbevolen: true,
      tekst: null,
    })
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc/beoordelingen/b1')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('PUT')

    await verspakkettenApi.removeBeoordeling('abc', 'b1')
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/abc/beoordelingen/b1')
    expect(laatsteAanroep(fetchMock)[1]?.method).toBe('DELETE')

    await verspakkettenApi.importFromUrl('https://example.nl/product')
    expect(laatsteAanroep(fetchMock)[0]).toBe('/api/verspakketten/import')
  })
})
