import { PALETTE_KEYS, type Palette, type ThemeMode } from '@nomai/theme'

/**
 * With no server this costs nothing: the whole state fits in the fragment, which the browser
 * never sends anywhere.
 *
 * **The symbol is left out on purpose.** An uploaded file never leaves the browser it was
 * dropped into, so a reference to it would arrive broken on the other side — and pointing at
 * a local file would contradict the promise the product rests on.
 *
 * Named parameters rather than positional ones: the link is readable, and a corrupted value
 * discards only that token instead of shifting every other one.
 */

const MODE_PARAM = 'mode'
const HEX = /^[0-9a-f]{6}$/i

export interface SharedState {
  readonly palette: Partial<Palette>
  readonly mode?: ThemeMode
}

export function encodeShare(palette: Palette, mode: ThemeMode): string {
  const params = new URLSearchParams()

  for (const key of PALETTE_KEYS) {
    // Without the `#`: inside a fragment it only confuses the reader, and saves seven characters.
    params.set(key, palette[key].replace('#', '').toLowerCase())
  }
  params.set(MODE_PARAM, mode)

  return params.toString()
}

export function decodeShare(hash: string): SharedState {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const palette: Partial<Palette> = {}

  for (const key of PALETTE_KEYS) {
    const value = params.get(key)
    if (value && HEX.test(value)) palette[key] = `#${value.toLowerCase()}`
  }

  const mode = params.get(MODE_PARAM)
  return mode === 'light' || mode === 'dark' ? { palette, mode } : { palette }
}

/** A link is only useful if it carries the whole palette; a missing token falls back to the default. */
export function isCompletePalette(palette: Partial<Palette>): palette is Palette {
  return PALETTE_KEYS.every((key) => Boolean(palette[key]))
}
