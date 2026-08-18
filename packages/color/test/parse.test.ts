import { describe, expect, it } from 'vitest'
import { parseCssColor } from '../src/index'

describe('parseCssColor', () => {
  describe('entrada ausente', () => {
    // A armadilha que classificava mono como duo: `getAttribute` devolve `null`,
    // `String(null)` vira "null", e "null" passava por qualquer teste de "tem valor".
    it('recusa null sem transformar em preto', () => {
      expect(parseCssColor(null)).toBeNull()
    })

    it('recusa undefined', () => {
      expect(parseCssColor(undefined)).toBeNull()
    })

    it('recusa a string literal "null"', () => {
      expect(parseCssColor('null')).toBeNull()
    })

    it('recusa string vazia e só espaço', () => {
      expect(parseCssColor('')).toBeNull()
      expect(parseCssColor('   ')).toBeNull()
    })
  })

  describe('valores que não são cor pintável', () => {
    it.each(['none', 'transparent', 'currentColor', 'inherit', 'initial', 'unset'])(
      'recusa %s',
      (value) => {
        expect(parseCssColor(value)).toBeNull()
      },
    )

    it('recusa referência a gradiente', () => {
      expect(parseCssColor('url(#grad)')).toBeNull()
    })

    it('recusa custom property, que exigiria avaliar a cascata', () => {
      expect(parseCssColor('var(--brand)')).toBeNull()
    })

    it('recusa lixo que não é cor', () => {
      expect(parseCssColor('not-a-color')).toBeNull()
      expect(parseCssColor('#12345')).toBeNull()
      expect(parseCssColor('#gggggg')).toBeNull()
      expect(parseCssColor('rgb(1, 2)')).toBeNull()
    })
  })

  describe('hexadecimal', () => {
    it('normaliza forma curta e caixa alta', () => {
      expect(parseCssColor('#ABC')).toBe('#aabbcc')
      expect(parseCssColor('  #16DB65 ')).toBe('#16db65')
    })

    it('descarta o canal alfa mas trata alfa zero como ausência de cor', () => {
      expect(parseCssColor('#16db6580')).toBe('#16db65')
      expect(parseCssColor('#16db6500')).toBeNull()
    })
  })

  describe('notação funcional', () => {
    it('aceita rgb legado e moderno', () => {
      expect(parseCssColor('rgb(22, 219, 101)')).toBe('#16db65')
      expect(parseCssColor('rgb(22 219 101)')).toBe('#16db65')
      expect(parseCssColor('rgba(22, 219, 101, 0.5)')).toBe('#16db65')
      expect(parseCssColor('rgb(22 219 101 / 50%)')).toBe('#16db65')
    })

    it('aceita porcentagem em rgb', () => {
      expect(parseCssColor('rgb(100%, 0%, 0%)')).toBe('#ff0000')
    })

    it('converte hsl', () => {
      expect(parseCssColor('hsl(0, 100%, 50%)')).toBe('#ff0000')
      expect(parseCssColor('hsl(120deg 100% 25%)')).toBe('#008000')
    })

    it('trata alfa zero como ausência de cor', () => {
      expect(parseCssColor('rgba(255, 0, 0, 0)')).toBeNull()
    })

    it('recusa função aninhada em vez de adivinhar', () => {
      expect(parseCssColor('rgb(calc(1 + 1), 0, 0)')).toBeNull()
    })
  })

  describe('nomes CSS', () => {
    it.each([
      ['black', '#000000'],
      ['White', '#ffffff'],
      ['REBECCAPURPLE', '#663399'],
    ])('resolve %s', (name, hex) => {
      expect(parseCssColor(name)).toBe(hex)
    })
  })
})
