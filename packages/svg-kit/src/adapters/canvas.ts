import { rasterConfig } from '../config'
import { inspectRasterPixels, type RasterInspection } from '../raster/inspect'

/**
 * The only part of the package that needs a real browser: reading a bitmap's pixels.
 * Isolated here so everything else stays pure and testable in Node.
 */
export function inspectRasterImage(image: CanvasImageSource): RasterInspection {
  const side = rasterConfig.sampleSize
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return { opaque: false, colors: [] }

  context.drawImage(image, 0, 0, side, side)

  try {
    const { data } = context.getImageData(0, 0, side, side)
    return inspectRasterPixels(data)
  } catch {
    // Canvas tainted by a cross-origin image. Should not happen with a `data:` URL from
    // FileReader, but failing open beats breaking the import.
    return { opaque: false, colors: [] }
  }
}
