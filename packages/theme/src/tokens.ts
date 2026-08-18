import { mix } from '@nomai/color'
import { softMix, inkMix } from './config'
import { CONTRAST_TARGETS, ensureContrast, isDark, readableOn } from './contrast'
import { PALETTE_KEYS, type Palette, type ThemeTokens } from './types'

/**
 * Fonte única dos tokens. O mockup **e** o CSS exportado saem daqui — no protótipo eram dois
 * caminhos separados, e o arquivo que o cliente baixava não reproduzia o que ele viu.
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
    // A marca só vira texto depois de passar pela busca de contraste: `brandSoft` é fundo
    // de pílula, e marca neon em cima dele é ilegível sem o empurrão.
    brandInk: ensureContrast(nudged, brandSoft, CONTRAST_TARGETS.text),
  }
}

/** Nomes das custom properties, num lugar só — o CSS e o export leem daqui. */
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

/** Bloco `:root` pronto para colar num projeto. */
export function tokensToCssText(tokens: ThemeTokens, label?: string): string {
  const declarations = Object.entries(tokensToCssVars(tokens))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  const header = label ? `/* ${label} */\n` : ''
  return `${header}:root {\n${declarations}\n}\n`
}
