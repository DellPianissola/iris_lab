export const PALETTE_KEYS = ['brand', 'accent', 'bg', 'surface', 'text', 'muted', 'line'] as const
export type PaletteKey = (typeof PALETTE_KEYS)[number]

/** The seven tokens the user edits. Everything else is derived. */
export type Palette = Record<PaletteKey, string>

export type ThemeMode = 'light' | 'dark'

export interface ThemeTokens extends Palette {
  /** Text colour that is legible on the brand — never white on the neon green. */
  readonly onBrand: string
  readonly onAccent: string
  /** Soft background for pills and icons. */
  readonly brandSoft: string
  /** The brand pushed until it becomes legible text on `brandSoft`. */
  readonly brandInk: string
}

/**
 * The ids are declared in code rather than inferred from the JSON so they become a literal
 * union: that is what lets the app type its translations as `Record<PresetId, string>` and
 * turn an untranslated preset into a compile error. `catalog.ts` checks the JSON carries
 * exactly these.
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
  /** Development label; what the customer reads comes from the app's dictionary, by id. */
  readonly name: string
  readonly mode: ThemeMode
  readonly colors: Palette
}

export interface FontChoice {
  readonly id: FontId
  readonly name: string
  readonly stack: string
}
