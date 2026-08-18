import { FONT_IDS, type FontId } from '@nomai/theme'

/** Padrões e limites dos controles. Nenhum literal solto nos componentes. */

export const controlDefaults = {
  wordmark: 'Íris|Code',
  markSize: 34,
  markRadius: 26,
  tracking: -1,
  buttonRadius: 10,
  displayFont: FONT_IDS[0] satisfies FontId,
  bodyFont: FONT_IDS[0] satisfies FontId,
  plate: false,
} as const

export const controlRanges = {
  markSize: { min: 20, max: 72 },
  markRadius: { min: 0, max: 50 },
  tracking: { min: -4, max: 6 },
  buttonRadius: { min: 0, max: 28 },
} as const

/** Proporções do lockup em relação ao tamanho do símbolo. */
export const lockupScale = {
  navWord: 0.62,
  footMark: 0.75,
  footWord: 0.46,
  platePadding: 0.2,
} as const

/** Tamanhos de favicon que importam de verdade. */
export const faviconSizes = [64, 32, 16] as const

/** Separador que destaca a segunda parte do nome na cor da marca. */
export const WORDMARK_SPLIT = '|'

export const STORAGE_KEY = 'iris.saved-palettes.v1'

/** Teto do upload. Acima disso o pipeline trava a aba antes de terminar. */
export const uploadLimits = {
  maxBytes: 4 * 1024 * 1024,
} as const
