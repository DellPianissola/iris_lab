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

  // With a cut-out, the colour comes from a CSS mask: the drawing becomes a silhouette and
  // takes the theme. That only makes sense when it was single-colour already — a silhouette
  // destroys a multicoloured logo.
  const kind: MarkKind = inspection.colors.length <= 1 ? 'mono' : 'multi'
  return { kind, mode: kind === 'mono' ? 'theme' : 'original', warnings: [] }
}
