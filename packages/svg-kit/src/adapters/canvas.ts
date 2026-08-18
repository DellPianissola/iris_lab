import { rasterConfig } from '../config'
import { inspectRasterPixels, type RasterInspection } from '../raster/inspect'

/**
 * A única parte do pacote que exige navegador de verdade: ler os pixels de um bitmap.
 * Fica isolada aqui para que o resto permaneça puro e testável em Node.
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
    // Canvas contaminado por imagem de outra origem. Não deveria acontecer com `data:`
    // vindo de FileReader, mas falhar aberto é melhor do que quebrar o import.
    return { opaque: false, colors: [] }
  }
}
