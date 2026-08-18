import brandData from '../data/brand.json' with { type: 'json' }
import fontsData from '../data/fonts.json' with { type: 'json' }
import presetsData from '../data/presets.json' with { type: 'json' }
import type { FontChoice, Palette, Preset, ThemeMode } from './types'

/**
 * Conteúdo do produto: as paletas de partida, as pilhas de fonte e a marca da casa. Mora em
 * JSON porque muda sem o código mudar — um dia pode vir de CMS ou ser editável.
 */

export const presets: readonly Preset[] = presetsData as readonly Preset[]
export const fonts: readonly FontChoice[] = fontsData as readonly FontChoice[]

export const brand = brandData

export function brandPalette(mode: ThemeMode): Palette {
  return (mode === 'dark' ? brand.dark : brand.light) as Palette
}

export function fontStack(id: string): string {
  const found = fonts.find((font) => font.id === id)
  return found ? found.stack : (fonts[0]?.stack ?? 'sans-serif')
}
