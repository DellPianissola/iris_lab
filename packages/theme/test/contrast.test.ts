import { contrastRatio } from '@nomai/color'
import { describe, expect, it } from 'vitest'
import { CONTRAST_TARGETS, ensureContrast, gradeOf, isDark, readableOn } from '../src/index'

const BRAND = '#16db65'

describe('readableOn', () => {
  // The brand rule: white on the neon green is 1.85:1, near-black is 10.21:1.
  it('picks near-black on the brand green, never white', () => {
    expect(readableOn(BRAND)).toBe('#111111')
  })

  it('picks white on a dark background', () => {
    expect(readableOn('#0c120e')).toBe('#ffffff')
  })
})

describe('ensureContrast', () => {
  it('returns the colour untouched when it already passes', () => {
    expect(ensureContrast('#111111', '#ffffff')).toBe('#111111')
  })

  // Without this function, a neon brand becomes unreadable copy.
  it('darkens the brand until it works as text on a light background', () => {
    const result = ensureContrast(BRAND, '#ffffff')

    expect(contrastRatio(BRAND, '#ffffff')).toBeLessThan(CONTRAST_TARGETS.text)
    expect(contrastRatio(result, '#ffffff')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('lightens instead of darkening when the background is dark', () => {
    const dark = '#0c120e'
    const result = ensureContrast('#0e813c', dark)

    expect(contrastRatio(result, dark)).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('preserves the hue — the result is still the same colour, only darker', () => {
    const result = ensureContrast(BRAND, '#ffffff')

    // Green stays green: the G channel remains dominant.
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(result.slice(i, i + 2), 16))
    expect(g).toBeGreaterThan(r ?? 0)
    expect(g).toBeGreaterThan(b ?? 0)
  })

  it('meets a higher target when asked', () => {
    const result = ensureContrast(BRAND, '#ffffff', CONTRAST_TARGETS.enhanced)

    expect(contrastRatio(result, '#ffffff')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.enhanced)
  })

  it('works for any hue, not only the green', () => {
    for (const color of ['#db2480', '#25317e', '#f59b14', '#22b8cf', '#c1121f']) {
      const onLight = ensureContrast(color, '#ffffff')
      const onDark = ensureContrast(color, '#0c120e')

      expect(contrastRatio(onLight, '#ffffff')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
      expect(contrastRatio(onDark, '#0c120e')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
    }
  })
})

describe('gradeOf', () => {
  it.each([
    [21, 'aaa'],
    [7, 'aaa'],
    [4.5, 'aa'],
    [3, 'large'],
    [2.9, 'fail'],
    [1, 'fail'],
  ])('%s → %s', (ratio, grade) => {
    expect(gradeOf(ratio)).toBe(grade)
  })
})

describe('isDark', () => {
  it('separates the backgrounds of the brand palettes', () => {
    expect(isDark('#0c120e')).toBe(true)
    expect(isDark('#ffffff')).toBe(false)
  })
})
