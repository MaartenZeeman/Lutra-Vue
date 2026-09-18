import { describe, expect, it } from 'vitest'

import { FOTO_PLAATSHOUDER, fotoDataUrl } from './image'

function base64VanBytes(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes))
}

describe('fotoDataUrl', () => {
  it('herkent png-bytes', () => {
    const data = base64VanBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

    expect(fotoDataUrl(data)).toBe(`data:image/png;base64,${data}`)
  })

  it('herkent jpeg-bytes', () => {
    const data = base64VanBytes([0xff, 0xd8, 0xff, 0xe0])

    expect(fotoDataUrl(data)).toBe(`data:image/jpeg;base64,${data}`)
  })

  it('herkent gif-bytes', () => {
    const data = base64VanBytes([0x47, 0x49, 0x46, 0x38])

    expect(fotoDataUrl(data)).toBe(`data:image/gif;base64,${data}`)
  })

  it('gebruikt de plaatshouder zonder fotodata', () => {
    expect(fotoDataUrl(null)).toBe(FOTO_PLAATSHOUDER)
    expect(fotoDataUrl('')).toBe(FOTO_PLAATSHOUDER)
  })

  it('valt terug op jpeg wanneer de bytes onbekend zijn', () => {
    const data = base64VanBytes([0x00, 0x01, 0x02, 0x03])

    expect(fotoDataUrl(data)).toBe(`data:image/jpeg;base64,${data}`)
  })
})
