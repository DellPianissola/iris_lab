import type { MarkKind, MarkMode, MarkWarning } from '@nomai/svg-kit'

/** A symbol available in the grid — built in or uploaded. */
interface MarkBase {
  readonly id: string
  readonly name: string
  readonly builtin: boolean
  readonly aspect: number
  readonly kind: MarkKind
  readonly palette: readonly string[]
  readonly warnings: readonly MarkWarning[]
  /** Decided by the classifier; the user only overrides if they want to. */
  mode: MarkMode
}

export interface SvgMark extends MarkBase {
  readonly type: 'svg'
  readonly original: string
  readonly themed: string
}

export interface RasterMark extends MarkBase {
  readonly type: 'raster'
  readonly url: string
}

export type Mark = SvgMark | RasterMark
