/** The package's public API. `apps/web` imports from here and nowhere else. */

export { importSvg, defaultModeFor } from './pipeline/import-svg'
export { sanitizeSvg } from './pipeline/sanitize'
export { normalizeSvg } from './pipeline/normalize'
export { analyzeSvg, findImplicitFillShapes } from './pipeline/analyze'
export { buildThemedSvg } from './pipeline/recolor'

export { inspectRasterPixels } from './raster/inspect'
export type { RasterInspection } from './raster/inspect'
export { classifyRaster } from './raster/classify'
export type { RasterClassification } from './raster/classify'

export { extractColorRules } from './css/rules'
export type { ColorDeclaration, ColorRule } from './css/rules'
export { specificityOf } from './css/specificity'

export { createDomFromGlobals } from './adapters/dom'
export type { SvgDom } from './adapters/dom'

export { COLOR_PROPS } from './svg-spec'
export type { ColorProp } from './svg-spec'
export type {
  ImportedSvg,
  MarkKind,
  MarkMode,
  MarkWarning,
  SvgAnalysis,
  WarningCode,
} from './types'
