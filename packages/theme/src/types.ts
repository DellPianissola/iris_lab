export const PALETTE_KEYS = ['brand', 'accent', 'bg', 'surface', 'text', 'muted', 'line'] as const
export type PaletteKey = (typeof PALETTE_KEYS)[number]

/** Os sete tokens que o usuário edita. Todo o resto é derivado. */
export type Palette = Record<PaletteKey, string>

export type ThemeMode = 'light' | 'dark'

export interface ThemeTokens extends Palette {
  /** Cor de texto legível em cima da marca — nunca branco no verde neon. */
  readonly onBrand: string
  readonly onAccent: string
  /** Fundo suave para pílula e ícone. */
  readonly brandSoft: string
  /** A marca empurrada até virar texto legível sobre `brandSoft`. */
  readonly brandInk: string
}

/**
 * Os ids ficam declarados em código, e não inferidos do JSON, para virarem união literal:
 * é o que permite ao app tipar a tradução como `Record<PresetId, string>` e transformar
 * preset sem tradução em erro de compilação. O `catalog.ts` confere que o JSON traz
 * exatamente estes.
 */
export const PRESET_IDS = [
  'iris-framboesa',
  'iris-indigo',
  'iris-ambar',
  'iris-escuro',
  'indigo-puro',
  'floresta',
  'carvao-neon',
  'terracota',
  'tinta-coral',
  'ciano-noturno',
  'malva-suave',
  'vermelho-seco',
] as const
export type PresetId = (typeof PRESET_IDS)[number]

export const FONT_IDS = ['grotesk', 'serif', 'mono', 'geometric', 'condensed'] as const
export type FontId = (typeof FONT_IDS)[number]

export interface Preset {
  readonly id: PresetId
  /** Rótulo de desenvolvimento; o que o cliente lê vem do dicionário do app, pelo id. */
  readonly name: string
  readonly mode: ThemeMode
  readonly colors: Palette
}

export interface FontChoice {
  readonly id: FontId
  readonly name: string
  readonly stack: string
}
