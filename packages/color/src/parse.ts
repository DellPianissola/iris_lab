import { hslToHex, toHex } from './convert'
import { NAMED_COLORS } from './named-colors'

/**
 * Replaces the trick of assigning the colour to a `<span>` and reading `getComputedStyle`
 * back: that forced a reflow per attribute per element, tied the code to a live `document`,
 * and under test would have measured the mock instead of the code.
 */

/** Values that are valid in `fill`/`stroke` but do not paint a colour. */
const NON_COLOR_KEYWORDS: ReadonlySet<string> = new Set([
  'none', 'transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'revert',
  'revert-layer', 'context-fill', 'context-stroke',
])

export function parseCssColor(value: string | null | undefined): string | null {
  // `getAttribute` returns `null` for a missing attribute. Convert before validating and
  // `String(null)` becomes the string "null", which passes any "has a value" check and ends
  // up resolving to black — inflating the colour count and classifying mono as duo. Hence
  // the type guard comes first.
  if (typeof value !== 'string') return null

  const raw = value.trim().toLowerCase()
  if (!raw || NON_COLOR_KEYWORDS.has(raw)) return null
  if (raw.startsWith('url(') || raw.startsWith('var(')) return null

  const named = NAMED_COLORS[raw]
  if (named) return named
  if (raw.startsWith('#')) return parseHex(raw)
  if (raw.startsWith('rgb')) return parseRgb(raw)
  if (raw.startsWith('hsl')) return parseHsl(raw)
  return null
}

function parseHex(raw: string): string | null {
  const digits = raw.slice(1)
  if (!/^[0-9a-f]+$/.test(digits)) return null

  let full: string
  if (digits.length === 3 || digits.length === 4) {
    full = digits.split('').map((d) => d + d).join('')
  } else if (digits.length === 6 || digits.length === 8) {
    full = digits
  } else {
    return null
  }

  if (full.length === 8 && parseInt(full.slice(6, 8), 16) === 0) return null
  return '#' + full.slice(0, 6)
}

interface FunctionalArgs {
  readonly parts: readonly string[]
  readonly alpha: number
}

function parseFunctional(raw: string, name: 'rgb' | 'hsl'): FunctionalArgs | null {
  const open = raw.indexOf('(')
  if (open < 0 || !raw.endsWith(')')) return null

  const head = raw.slice(0, open)
  if (head !== name && head !== `${name}a`) return null

  const inner = raw.slice(open + 1, -1)
  // A nested function (`calc()`, `var()`) would need a CSS evaluator; refusing beats
  // guessing and counting a colour that is not there.
  if (inner.includes('(')) return null

  const bySlash = inner.split('/')
  if (bySlash.length > 2) return null

  const parts = (bySlash[0] ?? '').replace(/,/g, ' ').trim().split(/\s+/).filter(Boolean)

  let alphaToken: string | undefined
  if (bySlash.length === 2) alphaToken = (bySlash[1] ?? '').trim()
  else if (parts.length === 4) alphaToken = parts.pop()

  if (parts.length !== 3) return null

  const alpha = alphaToken === undefined ? 1 : parseAlpha(alphaToken)
  if (alpha === null) return null

  return { parts, alpha }
}

function parseAlpha(token: string): number | null {
  const value = token.endsWith('%')
    ? parseNumber(token.slice(0, -1), 100)
    : parseNumber(token, 1)
  return value === null ? null : Math.max(0, Math.min(1, value))
}

function parseNumber(token: string, divisor: number): number | null {
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(token.trim())) return null
  return Number(token) / divisor
}

function parseChannel(token: string): number | null {
  if (token.endsWith('%')) {
    const percent = parseNumber(token.slice(0, -1), 1)
    return percent === null ? null : (percent / 100) * 255
  }
  return parseNumber(token, 1)
}

function parseRgb(raw: string): string | null {
  const args = parseFunctional(raw, 'rgb')
  if (!args || args.alpha === 0) return null

  const channels = args.parts.map(parseChannel)
  if (channels.some((channel) => channel === null)) return null

  const [r, g, b] = channels as number[]
  return toHex(r ?? 0, g ?? 0, b ?? 0)
}

function parseHsl(raw: string): string | null {
  const args = parseFunctional(raw, 'hsl')
  if (!args || args.alpha === 0) return null

  const hue = parseAngle(args.parts[0] ?? '')
  const saturation = parsePercent(args.parts[1] ?? '')
  const lightness = parsePercent(args.parts[2] ?? '')
  if (hue === null || saturation === null || lightness === null) return null

  return hslToHex(hue, saturation, lightness)
}

function parseAngle(token: string): number | null {
  const bare = token.endsWith('deg') ? token.slice(0, -3) : token
  return parseNumber(bare, 1)
}

function parsePercent(token: string): number | null {
  if (!token.endsWith('%')) return null
  const value = parseNumber(token.slice(0, -1), 100)
  return value === null ? null : Math.max(0, Math.min(1, value))
}
