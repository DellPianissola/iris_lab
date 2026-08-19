import { mix } from '@nomai/color'
import { softMix, inkMix } from './config'
import { CONTRAST_TARGETS, ensureContrast, isDark, readableOn } from './contrast'
import { PALETTE_KEYS, type Palette, type ThemeTokens } from './types'

/**
 * Single source for the tokens. The mockup **and** the exported CSS both come from here — in
 * the prototype they were separate paths, and the file the customer downloaded did not
 * reproduce what they had seen.
 */
export function buildTokens(palette: Palette): ThemeTokens {
  const darkBackground = isDark(palette.bg)
  const tone = darkBackground ? 'dark' : 'light'

  const brandSoft = mix(palette.bg, palette.brand, softMix[tone])
  const nudged = mix(palette.brand, darkBackground ? '#ffffff' : '#000000', inkMix[tone])

  return {
    ...palette,
    onBrand: readableOn(palette.brand),
    onAccent: readableOn(palette.accent),
    brandSoft,
    // The brand only becomes text after the contrast search: `brandSoft` is a pill
    // background, and neon brand on top of it is unreadable without the push.
    brandInk: ensureContrast(nudged, brandSoft, CONTRAST_TARGETS.text),
  }
}

/** Custom property names in one place — the CSS and the export both read from here. */
const CSS_VAR_PREFIX = '--c-'

const DERIVED_VAR_NAMES = {
  onBrand: 'on-brand',
  onAccent: 'on-accent',
  brandSoft: 'brand-soft',
  brandInk: 'brand-ink',
} as const

export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const key of PALETTE_KEYS) {
    vars[`${CSS_VAR_PREFIX}${key}`] = tokens[key]
  }
  for (const [key, name] of Object.entries(DERIVED_VAR_NAMES)) {
    vars[`${CSS_VAR_PREFIX}${name}`] = tokens[key as keyof typeof DERIVED_VAR_NAMES]
  }

  return vars
}

/** A `:root` block ready to paste into a project. */
export function tokensToCssText(tokens: ThemeTokens, label?: string): string {
  const declarations = Object.entries(tokensToCssVars(tokens))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  const header = label ? `/* ${label} */\n` : ''
  return `${header}:root {\n${declarations}\n}\n`
}
