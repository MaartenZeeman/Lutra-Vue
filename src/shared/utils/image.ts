const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="Geen foto beschikbaar">
  <rect width="400" height="300" fill="#eef3e9"/>
  <g fill="none" stroke="#a9b9a4" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <rect x="118" y="88" width="164" height="124" rx="14"/>
    <circle cx="166" cy="132" r="15"/>
    <path d="M130 200l50-54 40 44 28-26 42 40"/>
  </g>
</svg>`

export const FOTO_PLAATSHOUDER = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`

/**
 * The API returns photo bytes as base64 without a media type, so the type is sniffed
 * from the magic bytes before building a data URL.
 */
function detecteerMimeType(base64Data: string): string {
  try {
    const bytes = atob(base64Data.slice(0, 16))
    const byte = (index: number) => bytes.charCodeAt(index)

    if (byte(0) === 0x89 && byte(1) === 0x50 && byte(2) === 0x4e && byte(3) === 0x47) {
      return 'image/png'
    }

    if (byte(0) === 0xff && byte(1) === 0xd8 && byte(2) === 0xff) {
      return 'image/jpeg'
    }

    if (byte(0) === 0x47 && byte(1) === 0x49 && byte(2) === 0x46) {
      return 'image/gif'
    }

    if (byte(0) === 0x52 && byte(1) === 0x49 && byte(2) === 0x46 && byte(3) === 0x46) {
      return 'image/webp'
    }
  } catch {
    // Fall through to the default below when the data is not valid base64.
  }

  return 'image/jpeg'
}

export function fotoDataUrl(base64Data: string | null | undefined): string {
  if (base64Data === null || base64Data === undefined || base64Data.length === 0) {
    return FOTO_PLAATSHOUDER
  }

  return `data:${detecteerMimeType(base64Data)};base64,${base64Data}`
}
