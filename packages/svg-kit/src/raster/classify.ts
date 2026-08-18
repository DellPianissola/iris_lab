import type { MarkKind, MarkMode, MarkWarning } from '../types'
import type { RasterInspection } from './inspect'

export interface RasterClassification {
  readonly kind: MarkKind
  readonly mode: MarkMode
  readonly warnings: readonly MarkWarning[]
}

export function classifyRaster(inspection: RasterInspection): RasterClassification {
  if (inspection.opaque) {
    return { kind: 'raster-opaque', mode: 'original', warnings: [{ code: 'opaque-raster' }] }
  }

  // Com recorte, a cor vem de máscara CSS: o desenho vira silhueta e assume o tema. Só faz
  // sentido quando ele já era de uma cor só — silhueta destrói um logo colorido.
  const kind: MarkKind = inspection.colors.length <= 1 ? 'mono' : 'multi'
  return { kind, mode: kind === 'mono' ? 'theme' : 'original', warnings: [] }
}
