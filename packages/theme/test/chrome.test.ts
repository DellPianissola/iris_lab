import { contrastRatio } from '@nomai/color'
import { describe, expect, it } from 'vitest'
import { buildChrome, chromeToCssVars } from '../src/chrome'
import { CONTRAST_TARGETS, readableOn } from '../src/contrast'
import { brandPalette, presets } from '../src/catalog'
import { randomPalette } from '../src/derive'
import type { Palette } from '../src/types'

/**
 * The chrome follows the palette the customer edits, so its legibility is only as good as the
 * derivation. These are the pairs the tool would fail its own audit on, checked against every
 * palette that can reach it — the presets, both house palettes, and a deterministic sweep of
 * random ones, including the deliberately awful.
 */
const TEXT_PAIRS = [
  ['text on the panel', 'text', 'panel'],
  ['text on the field', 'text', 'panel-2'],
  ['muted text on the panel', 'dim', 'panel'],
  ['muted text on the field', 'dim', 'panel-2'],
  ['warning text on the field', 'warn', 'panel-2'],
  ['error text on the field', 'danger', 'panel-2'],
  ['the pass pill', 'pass', 'pass-bg'],
  ['the conditional pill', 'large', 'large-bg'],
  ['the fail pill', 'fail', 'fail-bg'],
  ['the pass reading on the bar', 'pass-on-bar', 'on-accent'],
  ['the conditional reading on the bar', 'large-on-bar', 'on-accent'],
  ['the fail reading on the bar', 'fail-on-bar', 'on-accent'],
  ['the open tool tab', 'text', 'bg'],
] as const

const NON_TEXT_PAIRS = [
  ['focus ring on the field', 'focus', 'panel-2'],
  ['faint icon on the panel', 'faint', 'panel'],
] as const

function vars(palette: Palette): Record<string, string> {
  const raw = chromeToCssVars(buildChrome(palette))
  const stripped: Record<string, string> = {}
  for (const [name, value] of Object.entries(raw)) stripped[name.replace('--ui-', '')] = value
  return stripped
}

/** A fixed seed: a failing palette has to be reproducible, not a Tuesday. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const random = seeded(20260820)
const sweep: readonly Palette[] = [
  brandPalette('light'),
  brandPalette('dark'),
  ...presets.map((preset) => preset.colors),
  ...Array.from({ length: 60 }, (_, index) => randomPalette(index % 2 ? 'light' : 'dark', random)),
]

/** Nothing in the tool is allowed to be less readable than the worst palette it is handed. */
const HOSTILE: readonly Palette[] = [
  // Mid grey everywhere: the background where neither black nor white has room.
  { brand: '#808080', accent: '#7f7f7f', bg: '#808080', surface: '#808080', text: '#808080', muted: '#808080', line: '#808080' },
  // Neon on white, which is the case the whole product exists to catch.
  { brand: '#16db65', accent: '#f9f871', bg: '#ffffff', surface: '#ffffff', text: '#fafafa', muted: '#f0f0f0', line: '#ffffff' },
  // The same in reverse.
  { brand: '#0a0a0a', accent: '#111111', bg: '#000000', surface: '#050505', text: '#080808', muted: '#0c0c0c', line: '#000000' },
]

describe('buildChrome', () => {
  it('covers every custom property the stylesheet reads', () => {
    expect(Object.keys(vars(brandPalette('light'))).sort()).toEqual(
      [
        'accent', 'bg', 'danger', 'dim', 'fail', 'fail-bg', 'fail-on-bar', 'faint', 'focus',
        'hover', 'large', 'large-bg', 'large-on-bar', 'line', 'on-accent', 'panel', 'panel-2',
        'pass', 'pass-bg', 'pass-on-bar', 'text', 'warn',
      ],
    )
  })

  // The hover surface is `line` and the resting one is `panel2`; the ladder is what makes that
  // a visible step instead of a magic fraction, so the rungs have to stay apart.
  it('keeps every rung of the surface ladder distinct', () => {
    for (const palette of [...sweep, ...HOSTILE]) {
      const chrome = buildChrome(palette)
      const ladder = [chrome.bg, chrome.panel, chrome.panel2, chrome.line, chrome.hover]

      expect(new Set(ladder).size).toBe(ladder.length)
    }
  })

  it('follows the palette instead of a fixed set', () => {
    const light = buildChrome(brandPalette('light'))
    const dark = buildChrome(brandPalette('dark'))

    expect(light.panel).not.toBe(dark.panel)
    expect(light.text).not.toBe(dark.text)
  })

  it.each(TEXT_PAIRS)('%s reaches 4.5:1 for every palette', (_name, a, b) => {
    for (const palette of sweep) {
      const chrome = vars(palette)
      expect(contrastRatio(chrome[a] as string, chrome[b] as string)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.text,
      )
    }
  })

  it.each(NON_TEXT_PAIRS)('%s reaches 3:1 for every palette', (_name, a, b) => {
    for (const palette of sweep) {
      const chrome = vars(palette)
      expect(contrastRatio(chrome[a] as string, chrome[b] as string)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.largeText,
      )
    }
  })

  // A pill drawn for one chrome and pasted onto the other is the defect this replaces: a
  // fixed dark-green lozenge is a hole punched in a light panel.
  it('tints each pill from the panel it sits on', () => {
    const light = buildChrome(brandPalette('light'))
    const dark = buildChrome(brandPalette('dark'))

    expect(light.passBg).not.toBe(dark.passBg)
    expect(contrastRatio(light.passBg, light.panel)).toBeLessThan(2)
    expect(contrastRatio(dark.passBg, dark.panel)).toBeLessThan(2)
  })

  /**
   * The reading rides the bar on `onAccent`, which is corrected against the brand, so the chip
   * is visible whatever the brand is — the failure this replaces was a solid chip vanishing
   * into a brand of a similar hue.
   */
  it('keeps the reading on the bar clear of the bar itself', () => {
    for (const palette of [...sweep, ...HOSTILE]) {
      const chrome = vars(palette)
      expect(
        contrastRatio(chrome['on-accent'] as string, chrome['accent'] as string),
      ).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
    }
  })

  /**
   * The bar floats over `.canvas`, which is painted in the customer's own background — the
   * chrome `bg` sits behind that and never shows. Correcting and checking against the same
   * ground the mockup's primary button stands on is what makes the two wear the brand alike.
   */
  it('keeps the toolbar clear of the page it floats over', () => {
    for (const palette of [...sweep, ...HOSTILE]) {
      expect(contrastRatio(buildChrome(palette).accent, palette.bg)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.largeText,
      )
    }
  })

  /**
   * The bar and the mockup's primary button wear the same brand, so a reader should not see
   * one in white and the other in black. They cannot always agree — the mockup is free to be
   * a bad choice, which is the product — but where the fill can be nudged into agreement it is.
   */
  it('lands on the same label colour as the mockup for the house palettes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const palette = brandPalette(mode)

      expect(buildChrome(palette).onAccent).toBe(readableOn(palette.brand))
    }
  })

  it('keeps the primary button legible on the accent', () => {
    for (const palette of sweep) {
      const chrome = vars(palette)
      expect(
        contrastRatio(chrome['on-accent'] as string, chrome['accent'] as string),
      ).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
    }
  })

  // The point of the fallback: `ensureContrast` alone gives up on these and returns a colour
  // that still misses, which would put an unreadable toolbar in front of the customer.
  it.each(HOSTILE.map((palette, index) => [index, palette] as const))(
    'stays readable on hostile palette %i',
    (_index, palette) => {
      const chrome = vars(palette)

      for (const [, a, b] of TEXT_PAIRS) {
        expect(contrastRatio(chrome[a] as string, chrome[b] as string)).toBeGreaterThanOrEqual(
          CONTRAST_TARGETS.text,
        )
      }
    },
  )
})
