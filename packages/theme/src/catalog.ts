import brandData from '../data/brand.json' with { type: 'json' }
import fontsData from '../data/fonts.json' with { type: 'json' }
import presetsData from '../data/presets.json' with { type: 'json' }
import {
  FONT_IDS,
  PALETTE_KEYS,
  PRESET_IDS,
  type FontChoice,
  type FontId,
  type Palette,
  type Preset,
  type PresetId,
  type ThemeMode,
} from './types'

/**
 * Product content: the starting palettes, the font stacks and the house brand. It lives in
 * JSON because it changes without the code changing — one day it may come from a CMS or be
 * editable.
 *
 * The JSON is validated on load rather than asserted into the type system. `data/` is
 * precisely the place edited without touching code, so it is where a typo happens — and a
 * missing key would become `undefined` painted into the CSS with nothing complaining.
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

/**
 * A map rather than a find-with-fallback: `requireExactIds` already guaranteed every
 * `FontId` exists, so a `?? 'sans-serif'` would be an unreachable branch — and unreachable
 * branches are where defects hide, which is exactly what `?? preset.name` used to do.
 */
const FONT_STACKS = Object.fromEntries(fonts.map((font) => [font.id, font.stack])) as Record<
  FontId,
  string
>

export function fontStack(id: FontId): string {
  return FONT_STACKS[id]
}

function validatePresets(raw: unknown): readonly Preset[] {
  const entries = asArray(raw, 'presets.json')

  const parsed = entries.map((entry, index) => {
    const where = `presets.json[${index}]`
    const record = asRecord(entry, where)
    const mode = record['mode']

    if (!THEME_MODES.includes(mode as ThemeMode)) {
      throw new Error(`${where}: "mode" must be light or dark, got ${JSON.stringify(mode)}`)
    }

    return {
      id: requireId(record, PRESET_IDS, where) as PresetId,
      name: requireString(record, 'name', where),
      mode: mode as ThemeMode,
      colors: validatePalette(record['colors'], `${where} → colors`),
    }
  })

  requireExactIds(parsed, PRESET_IDS, 'presets.json')
  return parsed
}

function validateFonts(raw: unknown): readonly FontChoice[] {
  const entries = asArray(raw, 'fonts.json')

  const parsed = entries.map((entry, index) => {
    const where = `fonts.json[${index}]`
    const record = asRecord(entry, where)
    return {
      id: requireId(record, FONT_IDS, where) as FontId,
      name: requireString(record, 'name', where),
      stack: requireString(record, 'stack', where),
    }
  })

  requireExactIds(parsed, FONT_IDS, 'fonts.json')
  return parsed
}

/**
 * The JSON must carry exactly the declared ids: no more, no fewer. A new id with no entry in
 * `types.ts` fails here, and a declared id with no translation fails the app's `tsc` — the
 * two halves of the same guarantee.
 */
function requireExactIds(
  parsed: readonly { readonly id: string }[],
  declared: readonly string[],
  where: string,
): void {
  const found = parsed.map((entry) => entry.id)
  const missing = declared.filter((id) => !found.includes(id))
  if (missing.length > 0) throw new Error(`${where}: missing ids ${missing.join(', ')}`)

  const duplicated = found.filter((id, index) => found.indexOf(id) !== index)
  if (duplicated.length > 0) throw new Error(`${where}: duplicated ids ${duplicated.join(', ')}`)
}

function requireId(
  record: Record<string, unknown>,
  declared: readonly string[],
  where: string,
): string {
  const id = requireString(record, 'id', where)
  if (!declared.includes(id)) {
    throw new Error(`${where}: id "${id}" is not declared in types.ts`)
  }
  return id
}

function validatePalette(raw: unknown, where: string): Palette {
  const record = asRecord(raw, where)
  const palette = {} as Record<string, string>

  for (const key of PALETTE_KEYS) {
    const value = requireString(record, key, where)
    if (!/^#[0-9a-f]{6}$/i.test(value)) {
      throw new Error(`${where}: "${key}" must be #rrggbb, got ${JSON.stringify(value)}`)
    }
    palette[key] = value.toLowerCase()
  }

  return palette as Palette
}

function asArray(value: unknown, where: string): readonly unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${where}: expected a non-empty list`)
  }
  return value
}

function asRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${where}: expected an object`)
  }
  return value as Record<string, unknown>
}

function requireString(record: Record<string, unknown>, key: string, where: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${where}: missing key "${key}"`)
  }
  return value
}
