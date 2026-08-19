import { toHex } from '@nomai/color'
import { rasterConfig } from '../config'

/**
 * PNG/JPG inspection. Takes raw pixels rather than a `<canvas>` so it stays pure and
 * testable in Node — `adapters/canvas.ts` is what draws the image onto a canvas.
 */

export interface RasterInspection {
  /** No transparent cut-out: colouring it would produce a solid rectangle. */
  readonly opaque: boolean
  readonly colors: readonly string[]
}

const CHANNELS_PER_PIXEL = 4

/** `data` is flattened RGBA; the pixel count comes from it so there are not two versions of it. */
export function inspectRasterPixels(data: ArrayLike<number>): RasterInspection {
  const pixelCount = Math.floor(data.length / CHANNELS_PER_PIXEL)
  const buckets = new Map<string, number>()
  let transparent = 0

  for (let i = 0; i < data.length; i += CHANNELS_PER_PIXEL) {
    const alpha = data[i + 3] ?? 0
    if (alpha < rasterConfig.alphaFloor) {
      transparent += 1
      continue
    }

    const key = bucketKey(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  const floor = pixelCount * rasterConfig.significantArea
  const colors = [...buckets.entries()]
    .filter(([, count]) => count > floor)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => bucketToHex(key))

  return { opaque: transparent < floor, colors }
}

function bucketKey(r: number, g: number, b: number): string {
  const shift = rasterConfig.channelBucketBits
  return `${r >> shift},${g >> shift},${b >> shift}`
}

function bucketToHex(key: string): string {
  const size = 1 << rasterConfig.channelBucketBits
  const [r = 0, g = 0, b = 0] = key.split(',').map(Number)
  // The band's centre represents the group better than its lower edge.
  return toHex(r * size + size / 2, g * size + size / 2, b * size + size / 2)
}
