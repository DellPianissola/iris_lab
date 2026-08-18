export const PALETTE_KEYS = ['brand', 'accent', 'bg', 'surface', 'text', 'muted', 'line'] as const
export type PaletteKey = (typeof PALETTE_KEYS)[number]

/** Os sete tokens que o usuário edita. Todo o resto é derivado. */
export type Palette = Record<PaletteKey, string>

export type ThemeMode = 'light' | 'dark'

/** O que o mockup consome: os sete editáveis mais os quatro calculados. */
export interface ThemeTokens extends Palette {
  /** Cor de texto legível em cima da marca — nunca branco no verde neon. */
  readonly onBrand: string
  readonly onAccent: string
  /** Fundo suave para pílula e ícone. */
  readonly brandSoft: string
  /** A marca empurrada até virar texto legível sobre `brandSoft`. */
  readonly brandInk: string
}

export interface Preset {
  readonly id: string
  readonly name: string
  readonly mode: ThemeMode
  readonly colors: Palette
}

export interface FontChoice {
  readonly id: string
  readonly name: string
  readonly stack: string
}
