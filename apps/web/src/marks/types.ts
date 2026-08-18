import type { MarkKind, MarkMode, MarkWarning } from '@nomai/svg-kit'

/** Um símbolo disponível na grade — embutido ou enviado pelo usuário. */
interface MarkBase {
  readonly id: string
  readonly name: string
  readonly builtin: boolean
  readonly aspect: number
  readonly kind: MarkKind
  readonly palette: readonly string[]
  readonly warnings: readonly MarkWarning[]
  /** Decidido pelo classificador; o usuário só discorda se quiser. */
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
