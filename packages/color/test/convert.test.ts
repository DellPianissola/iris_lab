import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToHsl, hexToRgb, hslToHex, mix, relativeLuminance } from '../src/index'

describe('hexToRgb', () => {
  it('reads long and short form', () => {
    expect(hexToRgb('#16db65')).toEqual([22, 219, 101])
    expect(hexToRgb('#abc')).toEqual([170, 187, 204])
  })
})

describe('rgbToHsl / hslToHex', () => {
  it('round-trips without losing the colour', () => {
    for (const hex of ['#16db65', '#db2480', '#25317e', '#f59b14', '#0c120e']) {
      const [h, s, l] = hexToHsl(hex)
      expect(hslToHex(h, s, l)).toBe(hex)
    }
  })

  it('zeroes saturation on grey', () => {
    const [, saturation] = hexToHsl('#808080')
    expect(saturation).toBe(0)
  })
})

describe('mix', () => {
  it('returns the endpoints at the ends', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('interpolates in the middle', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

describe('relativeLuminance', () => {
  it('anchors at both ends of the scale', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBe(1)
  })
})

describe('contrastRatio', () => {
  it('ranges from 1 to 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#16db65', '#ffffff')).toBe(contrastRatio('#ffffff', '#16db65'))
  })

  // The brand's numbers. The brief attributes 11.35:1 to "near-black", but 11.35 is the
  // ratio against **pure** black; near-black #111111 gives 10.21. The product conclusion is
  // unchanged — white fails, dark passes with room — the number was on the wrong swatch.
  it('confirms white text on the brand green is unreadable', () => {
    expect(contrastRatio('#16db65', '#ffffff')).toBeCloseTo(1.85, 1)
    expect(contrastRatio('#16db65', '#000000')).toBeCloseTo(11.35, 1)
    expect(contrastRatio('#16db65', '#111111')).toBeCloseTo(10.21, 1)
  })
})
