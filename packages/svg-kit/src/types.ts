export type { ColorProp } from './svg-spec'

/**
 * O que o classificador conclui sobre o símbolo. Decide sozinho o modo padrão — a
 * interface nunca pergunta ao usuário, só oferece um interruptor já na posição certa.
 */
export type MarkKind = 'mono' | 'duo' | 'multi' | 'raster' | 'raster-opaque'

/** `theme` = o símbolo assume as cores do site. `original` = mantém as próprias. */
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
  /** Cores distintas, da mais usada para a menos usada. */
  readonly palette: readonly string[]
  readonly counts: Readonly<Record<string, number>>
  readonly warnings: readonly MarkWarning[]
  readonly kind: MarkKind
  /** Razão largura/altura do viewBox; 1 quando ausente. */
  readonly aspect: number
}

export interface ImportedSvg {
  readonly type: 'svg'
  readonly analysis: SvgAnalysis
  /** Markup sanitizado e normalizado, com as cores originais. */
  readonly original: string
  /** Mesmo desenho com as cores trocadas por `--tone-0` / `--tone-1`. */
  readonly themed: string
  readonly mode: MarkMode
}
