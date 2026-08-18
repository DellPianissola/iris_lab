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

/**
 * Mapa em vez de busca com fallback: `requireExactIds` já garantiu que todo `FontId` existe,
 * então um `?? 'sans-serif'` seria ramo inalcançável — e ramo inalcançável é onde defeito se
 * esconde, que foi exatamente o que o `?? preset.name` fazia antes.
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
      throw new Error(`${where}: "mode" deve ser light ou dark, veio ${JSON.stringify(mode)}`)
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
 * O JSON precisa trazer exatamente os ids declarados: nem a mais nem a menos. Id novo sem
 * entrada em `types.ts` reprova aqui, e id declarado sem tradução reprova no `tsc` do app —
 * as duas metades da mesma garantia.
 */
function requireExactIds(
  parsed: readonly { readonly id: string }[],
  declared: readonly string[],
  where: string,
): void {
  const found = parsed.map((entry) => entry.id)
  const missing = declared.filter((id) => !found.includes(id))
  if (missing.length > 0) throw new Error(`${where}: faltam os ids ${missing.join(', ')}`)

  const duplicated = found.filter((id, index) => found.indexOf(id) !== index)
  if (duplicated.length > 0) throw new Error(`${where}: ids repetidos ${duplicated.join(', ')}`)
}

function requireId(
  record: Record<string, unknown>,
  declared: readonly string[],
  where: string,
): string {
  const id = requireString(record, 'id', where)
  if (!declared.includes(id)) {
    throw new Error(`${where}: id "${id}" não está declarado em types.ts`)
  }
  return id
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

function asArray(value: unknown, where: string): readonly unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${where}: esperava uma lista não vazia`)
  }
  return value
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
