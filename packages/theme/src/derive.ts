import { hexToHsl, hslToHex } from '@nomai/color'
import { accentHarmony, neutralRecipes, randomRanges } from './config'
import type { Palette, ThemeMode } from './types'

/**
 * Deriva fundo, superfície, texto, suave e bordas a partir do matiz da marca. Preservar o
 * matiz é o que faz a paleta parecer intencional em vez de sorteada.
 */
export function deriveNeutrals(brand: string, mode: ThemeMode): Omit<Palette, 'brand' | 'accent'> {
  const [hue] = hexToHsl(brand)
  const recipe = neutralRecipes[mode]

  return {
    bg: hslToHex(hue, recipe.bg.saturation, recipe.bg.lightness),
    surface: hslToHex(hue, recipe.surface.saturation, recipe.surface.lightness),
    text: hslToHex(hue, recipe.text.saturation, recipe.text.lightness),
    muted: hslToHex(hue, recipe.muted.saturation, recipe.muted.lightness),
    line: hslToHex(hue, recipe.line.saturation, recipe.line.lightness),
  }
}

/** Acento perto do complementar da marca, sem cair exatamente nele. */
export function harmonizeAccent(brand: string, mode: ThemeMode, random = Math.random): string {
  const [hue, saturation] = hexToHsl(brand)
  const jitter = (random() * 2 - 1) * accentHarmony.jitterDeg

  return hslToHex(
    hue + accentHarmony.rotationDeg + jitter,
    clamp(saturation + accentHarmony.saturationBoost, accentHarmony.minSaturation, accentHarmony.maxSaturation),
    accentHarmony.lightness[mode],
  )
}

/** Paleta inteira sorteada, mas coerente: um matiz manda em tudo. */
export function randomPalette(mode: ThemeMode, random = Math.random): Palette {
  const hue = random() * 360
  const lightnessRange = randomRanges.lightness[mode]

  const brand = hslToHex(
    hue,
    randomRanges.saturation.min + random() * randomRanges.saturation.spread,
    lightnessRange.min + random() * lightnessRange.spread,
  )

  const rotation =
    random() < 0.5
      ? randomRanges.accentRotation.complementary.min +
        random() * randomRanges.accentRotation.complementary.spread
      : randomRanges.accentRotation.analogous.min +
        random() * randomRanges.accentRotation.analogous.spread

  const accent = hslToHex(
    hue + rotation,
    accentHarmony.minSaturation + random() * (accentHarmony.maxSaturation - accentHarmony.minSaturation),
    accentHarmony.lightness[mode],
  )

  return { brand, accent, ...deriveNeutrals(brand, mode) }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
