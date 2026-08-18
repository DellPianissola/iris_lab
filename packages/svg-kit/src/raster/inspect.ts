import { toHex } from '@nomai/color'
import { rasterConfig } from '../config'

/**
 * Inspeção de PNG/JPG. Recebe pixels crus em vez de um `<canvas>` para continuar puro e
 * testável em Node — quem desenha a imagem no canvas é `adapters/canvas.ts`.
 */

export interface RasterInspection {
  /** Sem recorte transparente: colorir viraria um retângulo sólido. */
  readonly opaque: boolean
  readonly colors: readonly string[]
}

export function inspectRasterPixels(
  data: ArrayLike<number>,
  pixelCount: number,
): RasterInspection {
  const buckets = new Map<string, number>()
  let transparent = 0

  for (let i = 0; i < data.length; i += 4) {
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
  // Centro da faixa representa melhor o grupo do que a borda inferior.
  return toHex(r * size + size / 2, g * size + size / 2, b * size + size / 2)
}
