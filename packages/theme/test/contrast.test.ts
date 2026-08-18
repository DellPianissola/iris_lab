import { contrastRatio } from '@nomai/color'
import { describe, expect, it } from 'vitest'
import { CONTRAST_TARGETS, ensureContrast, gradeOf, isDark, readableOn } from '../src/index'

const BRAND = '#16db65'

describe('readableOn', () => {
  // A regra da marca: branco em cima do verde neon é 1.85:1, quase-preto é 11.35:1.
  it('escolhe quase-preto sobre o verde da marca, nunca branco', () => {
    expect(readableOn(BRAND)).toBe('#111111')
  })

  it('escolhe branco sobre fundo escuro', () => {
    expect(readableOn('#0c120e')).toBe('#ffffff')
  })
})

describe('ensureContrast', () => {
  it('devolve a cor intacta quando ela já passa', () => {
    expect(ensureContrast('#111111', '#ffffff')).toBe('#111111')
  })

  // Sem esta função, marca neon vira texto ilegível.
  it('escurece a marca até ela servir de texto em fundo claro', () => {
    const result = ensureContrast(BRAND, '#ffffff')

    expect(contrastRatio(BRAND, '#ffffff')).toBeLessThan(CONTRAST_TARGETS.text)
    expect(contrastRatio(result, '#ffffff')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('clareia em vez de escurecer quando o fundo é escuro', () => {
    const dark = '#0c120e'
    const result = ensureContrast('#0e813c', dark)

    expect(contrastRatio(result, dark)).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('preserva o matiz — o resultado ainda é a mesma cor, só mais escura', () => {
    const result = ensureContrast(BRAND, '#ffffff')

    // Verde continua verde: o canal G segue dominante.
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(result.slice(i, i + 2), 16))
    expect(g).toBeGreaterThan(r ?? 0)
    expect(g).toBeGreaterThan(b ?? 0)
  })

  it('atende alvo mais alto quando pedido', () => {
    const result = ensureContrast(BRAND, '#ffffff', CONTRAST_TARGETS.enhanced)

    expect(contrastRatio(result, '#ffffff')).toBeGreaterThanOrEqual(CONTRAST_TARGETS.enhanced)
  })

  it('funciona para qualquer matiz, não só o verde', () => {
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
  it('separa os fundos das paletas da marca', () => {
    expect(isDark('#0c120e')).toBe(true)
    expect(isDark('#ffffff')).toBe(false)
  })
})
