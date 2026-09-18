import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = resolve(projectRoot, 'public')

const BACKGROUND = [15, 118, 110]
const FOREGROUND = [255, 255, 255]
const SAMPLES_PER_AXIS = 3

function crc32(buffer) {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData), 0)

  return Buffer.concat([length, typeAndData, crc])
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  header[10] = 0
  header[11] = 0
  header[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    signature,
    createChunk('IHDR', header),
    createChunk('IDAT', deflateSync(raw, { level: 9 })),
    createChunk('IEND', Buffer.alloc(0)),
  ])
}

function roundedRectContains(x, y, minX, minY, maxX, maxY, radius) {
  if (x < minX || x > maxX || y < minY || y > maxY) {
    return false
  }

  const r = Math.min(radius, (maxX - minX) / 2, (maxY - minY) / 2)
  if (r <= 0) {
    return true
  }

  const closestX = Math.min(Math.max(x, minX + r), maxX - r)
  const closestY = Math.min(Math.max(y, minY + r), maxY - r)
  const dx = x - closestX
  const dy = y - closestY

  return dx * dx + dy * dy <= r * r
}

function isInLetter(x, y, size) {
  const verticalBar = x >= size * 0.33 && x <= size * 0.45 && y >= size * 0.26 && y <= size * 0.74
  const horizontalBar = x >= size * 0.33 && x <= size * 0.67 && y >= size * 0.62 && y <= size * 0.74

  return verticalBar || horizontalBar
}

function createIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  const radius = maskable ? 0 : Math.round(size * 0.22)
  const sampleCount = SAMPLES_PER_AXIS * SAMPLES_PER_AXIS

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let backgroundHits = 0
      let foregroundHits = 0

      for (let sy = 0; sy < SAMPLES_PER_AXIS; sy += 1) {
        for (let sx = 0; sx < SAMPLES_PER_AXIS; sx += 1) {
          const sampleX = x + (sx + 0.5) / SAMPLES_PER_AXIS
          const sampleY = y + (sy + 0.5) / SAMPLES_PER_AXIS

          if (!roundedRectContains(sampleX, sampleY, 0, 0, size, size, radius)) {
            continue
          }

          backgroundHits += 1
          if (isInLetter(sampleX, sampleY, size)) {
            foregroundHits += 1
          }
        }
      }

      const offset = (y * size + x) * 4
      const alpha = Math.round((backgroundHits / sampleCount) * 255)

      if (backgroundHits === 0) {
        pixels[offset] = 0
        pixels[offset + 1] = 0
        pixels[offset + 2] = 0
        pixels[offset + 3] = 0
        continue
      }

      const foregroundRatio = foregroundHits / backgroundHits
      for (let channel = 0; channel < 3; channel += 1) {
        const value =
          BACKGROUND[channel] * (1 - foregroundRatio) + FOREGROUND[channel] * foregroundRatio
        pixels[offset + channel] = Math.round(value)
      }
      pixels[offset + 3] = alpha
    }
  }

  return encodePng(size, size, pixels)
}

const icons = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'maskable-icon-512x512.png', size: 512, maskable: true },
]

mkdirSync(outputDir, { recursive: true })

for (const icon of icons) {
  const buffer = createIcon(icon.size, { maskable: icon.maskable })
  writeFileSync(resolve(outputDir, icon.file), buffer)
  console.log(`Generated public/${icon.file}`)
}
