import { createDomFromGlobals, importSvg, inspectRasterPixels, classifyRaster } from '@nomai/svg-kit'
import { inspectRasterImage } from '@nomai/svg-kit/browser'
import type { Mark, RasterMark, SvgMark } from './types'

/**
 * Entrada de símbolos. Os embutidos passam pelo **mesmo pipeline** que os enviados — se a
 * classificação quebrar, quebra para todos, não só para o arquivo do cliente.
 */

const dom = createDomFromGlobals()

const builtinModules = import.meta.glob('../assets/marks/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const builtinMarks: readonly SvgMark[] = Object.entries(builtinModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([path, markup]) => {
    const mark = toSvgMark(markup, fileName(path), true)
    return mark ? [mark] : []
  })

function fileName(path: string): string {
  return path.split('/').pop()?.replace(/\.svg$/, '') ?? path
}

function toSvgMark(markup: string, name: string, builtin: boolean): SvgMark | null {
  const result = importSvg(markup, dom)
  if (!result) return null

  return {
    type: 'svg',
    id: `${builtin ? 'builtin' : 'upload'}:${name}:${crypto.randomUUID()}`,
    name,
    builtin,
    aspect: result.analysis.aspect,
    kind: result.analysis.kind,
    palette: result.analysis.palette,
    warnings: result.analysis.warnings,
    mode: result.mode,
    original: result.original,
    themed: result.themed,
  }
}

export async function readMarkFile(file: File): Promise<Mark | null> {
  const isSvg = file.type.includes('svg') || /\.svg$/i.test(file.name)
  return isSvg ? readSvgFile(file) : readRasterFile(file)
}

async function readSvgFile(file: File): Promise<Mark | null> {
  return toSvgMark(await file.text(), file.name, false)
}

async function readRasterFile(file: File): Promise<RasterMark | null> {
  const url = await readAsDataUrl(file)
  const image = await loadImage(url)
  if (!image) return null

  const inspection = inspectRasterImage(image)
  const classification = classifyRaster(inspection)

  return {
    type: 'raster',
    id: `upload:${file.name}:${crypto.randomUUID()}`,
    name: file.name,
    builtin: false,
    aspect: image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1,
    kind: classification.kind,
    palette: inspection.colors,
    warnings: classification.warnings,
    mode: classification.mode,
    url,
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(new Error('não consegui ler o arquivo')))
    reader.readAsDataURL(file)
  })
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => resolve(null))
    image.src = url
  })
}

/** Reexportado para quem quiser inspecionar pixels sem passar por `<canvas>`. */
export { inspectRasterPixels }
