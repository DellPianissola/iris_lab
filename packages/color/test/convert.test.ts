import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToHsl, hexToRgb, hslToHex, mix, relativeLuminance } from '../src/index'

describe('hexToRgb', () => {
  it('lê forma longa e curta', () => {
    expect(hexToRgb('#16db65')).toEqual([22, 219, 101])
    expect(hexToRgb('#abc')).toEqual([170, 187, 204])
  })
})

describe('rgbToHsl / hslToHex', () => {
  it('faz a volta completa sem perder a cor', () => {
    for (const hex of ['#16db65', '#db2480', '#25317e', '#f59b14', '#0c120e']) {
      const [h, s, l] = hexToHsl(hex)
      expect(hslToHex(h, s, l)).toBe(hex)
    }
  })

  it('zera a saturação em cinza', () => {
    const [, saturation] = hexToHsl('#808080')
    expect(saturation).toBe(0)
  })
})

describe('mix', () => {
  it('devolve os extremos nas pontas', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('interpola no meio', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

describe('relativeLuminance', () => {
  it('ancora nos extremos da escala', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBe(1)
  })
})

describe('contrastRatio', () => {
  it('vai de 1 a 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('é simétrica', () => {
    expect(contrastRatio('#16db65', '#ffffff')).toBe(contrastRatio('#ffffff', '#16db65'))
  })

  // Os números da marca. O briefing atribui 11.35:1 ao "quase-preto", mas 11.35 é a razão
  // contra preto **puro**; o quase-preto #111111 dá 10.21. A conclusão de produto não muda
  // — branco reprova, escuro passa com folga — só o número estava colado no tom errado.
  it('confirma que texto branco sobre o verde da marca é ilegível', () => {
    expect(contrastRatio('#16db65', '#ffffff')).toBeCloseTo(1.85, 1)
    expect(contrastRatio('#16db65', '#000000')).toBeCloseTo(11.35, 1)
    expect(contrastRatio('#16db65', '#111111')).toBeCloseTo(10.21, 1)
  })
})
