import { classifyRaster, createDomFromGlobals, importSvg } from '@nomai/svg-kit'
import { inspectRasterImage } from '@nomai/svg-kit/browser'
import { uploadLimits } from '../state/config'
import type { Mark, RasterMark, SvgMark } from './types'

/**
 * Entrada de símbolos. Os embutidos passam pelo **mesmo pipeline** que os enviados — se a
 * classificação quebrar, quebra para todos, não só para o arquivo do cliente.
 *
 * Nada aqui lança: toda falha vira um `MarkImport` com motivo, para que a interface sempre
 * tenha o que dizer. Promessa rejeitada aqui virava tela parada, porque o chamador não
 * tinha como distinguir "não deu" de "ainda processando".
 */

const dom = createDomFromGlobals()

export type ImportFailure = 'too-large' | 'unreadable'

export type MarkImport =
  | { readonly ok: true; readonly mark: Mark }
  | { readonly ok: false; readonly reason: ImportFailure }

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

export async function readMarkFile(file: File): Promise<MarkImport> {
  // Sem servidor, o único prejudicado por um arquivo gigante é quem enviou — mas a aba
  // congela sem explicação enquanto o pipeline percorre dezenas de milhares de nós.
  if (file.size > uploadLimits.maxBytes) return { ok: false, reason: 'too-large' }

  const isSvg = file.type.includes('svg') || /\.svg$/i.test(file.name)
  const mark = isSvg ? await readSvgFile(file) : await readRasterFile(file)

  return mark ? { ok: true, mark } : { ok: false, reason: 'unreadable' }
}

async function readSvgFile(file: File): Promise<Mark | null> {
  const text = await readAsText(file)
  return text === null ? null : toSvgMark(text, file.name, false)
}

async function readRasterFile(file: File): Promise<RasterMark | null> {
  const url = await readAsDataUrl(file)
  if (url === null) return null

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

function readAsText(file: File): Promise<string | null> {
  return readFile((reader) => reader.readAsText(file))
}

function readAsDataUrl(file: File): Promise<string | null> {
  return readFile((reader) => reader.readAsDataURL(file))
}

function readFile(start: (reader: FileReader) => void): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => resolve(null))
    reader.addEventListener('abort', () => resolve(null))
    start(reader)
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
