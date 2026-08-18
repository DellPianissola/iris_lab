import brandData from '../data/brand.json' with { type: 'json' }
import fontsData from '../data/fonts.json' with { type: 'json' }
import presetsData from '../data/presets.json' with { type: 'json' }
import { PALETTE_KEYS, type FontChoice, type Palette, type Preset, type ThemeMode } from './types'

/**
 * Conteúdo do produto: as paletas de partida, as pilhas de fonte e a marca da casa. Mora em
 * JSON porque muda sem o código mudar — um dia pode vir de CMS ou ser editável.
 *
 * O JSON é validado na carga em vez de entrar por asserção de tipo. `data/` é justamente o
 * lugar que se edita sem tocar em código, logo é onde o erro de digitação acontece — e uma
 * chave faltando viraria `undefined` pintado no CSS, sem nada reclamar.
 */

const THEME_MODES: readonly ThemeMode[] = ['light', 'dark']

export const presets: readonly Preset[] = validatePresets(presetsData)
export const fonts: readonly FontChoice[] = validateFonts(fontsData)
export const brand = {
  name: brandData.name,
  company: brandData.company,
  light: validatePalette(brandData.light, 'brand.json → light'),
  dark: validatePalette(brandData.dark, 'brand.json → dark'),
}

export function brandPalette(mode: ThemeMode): Palette {
  return mode === 'dark' ? brand.dark : brand.light
}

export function fontStack(id: string): string {
  const found = fonts.find((font) => font.id === id)
  return found ? found.stack : (fonts[0]?.stack ?? 'sans-serif')
}

function validatePresets(raw: unknown): readonly Preset[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('presets.json: esperava uma lista não vazia')
  }

  return raw.map((entry, index) => {
    const where = `presets.json[${index}]`
    const record = asRecord(entry, where)
    const mode = record['mode']

    if (!THEME_MODES.includes(mode as ThemeMode)) {
      throw new Error(`${where}: "mode" deve ser light ou dark, veio ${JSON.stringify(mode)}`)
    }

    return {
      id: requireString(record, 'id', where),
      name: requireString(record, 'name', where),
      mode: mode as ThemeMode,
      colors: validatePalette(record['colors'], `${where} → colors`),
    }
  })
}

function validateFonts(raw: unknown): readonly FontChoice[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('fonts.json: esperava uma lista não vazia')
  }

  return raw.map((entry, index) => {
    const where = `fonts.json[${index}]`
    const record = asRecord(entry, where)
    return {
      id: requireString(record, 'id', where),
      name: requireString(record, 'name', where),
      stack: requireString(record, 'stack', where),
    }
  })
}

function validatePalette(raw: unknown, where: string): Palette {
  const record = asRecord(raw, where)
  const palette = {} as Record<string, string>

  for (const key of PALETTE_KEYS) {
    const value = requireString(record, key, where)
    if (!/^#[0-9a-f]{6}$/i.test(value)) {
      throw new Error(`${where}: "${key}" deve ser #rrggbb, veio ${JSON.stringify(value)}`)
    }
    palette[key] = value.toLowerCase()
  }

  return palette as Palette
}

function asRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${where}: esperava um objeto`)
  }
  return value as Record<string, unknown>
}

function requireString(record: Record<string, unknown>, key: string, where: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${where}: falta a chave "${key}"`)
  }
  return value
}
