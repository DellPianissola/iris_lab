export type { ColorProp } from './svg-spec'

/**
 * What the classifier concludes about the symbol. It decides the default mode on its own —
 * the interface never asks, it only offers a switch already in the right position.
 */
export type MarkKind = 'mono' | 'duo' | 'multi' | 'raster' | 'raster-opaque'

/** `theme` = the symbol takes the site's colours. `original` = it keeps its own. */
export type MarkMode = 'theme' | 'original'

export type WarningCode =
  | 'embedded-raster'
  | 'gradient'
  | 'missing-viewbox'
  | 'opaque-raster'

export interface MarkWarning {
  readonly code: WarningCode
}

export interface SvgAnalysis {
  /** Distinct colours, most used first. */
  readonly palette: readonly string[]
  readonly counts: Readonly<Record<string, number>>
  readonly warnings: readonly MarkWarning[]
  readonly kind: MarkKind
  /** viewBox width/height ratio; 1 when absent. */
  readonly aspect: number
}

export interface ImportedSvg {
  readonly type: 'svg'
  readonly analysis: SvgAnalysis
  /** Sanitised and normalised markup, with the original colours. */
  readonly original: string
  /** The same drawing with its colours swapped for `--tone-0` / `--tone-1`. */
  readonly themed: string
  readonly mode: MarkMode
}
