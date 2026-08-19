import { FONT_IDS, type FontId } from '@nomai/theme'

/** Control defaults and ranges. No loose literals in the components. */

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

/** Lockup proportions relative to the symbol size. */
export const lockupScale = {
  navWord: 0.62,
  footMark: 0.75,
  footWord: 0.46,
  platePadding: 0.2,
} as const

/** The favicon sizes that actually matter. */
export const faviconSizes = [64, 32, 16] as const

/** Separator that highlights the second half of the name in the brand colour. */
export const WORDMARK_SPLIT = '|'

export const STORAGE_KEY = 'iris.saved-palettes.v1'

/** Upload ceiling. Beyond this the pipeline freezes the tab before it finishes. */
export const uploadLimits = {
  maxBytes: 4 * 1024 * 1024,
} as const
