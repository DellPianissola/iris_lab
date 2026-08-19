import { describe, expect, it } from 'vitest'
import { parseCssColor } from '../src/index'

describe('parseCssColor', () => {
  describe('missing input', () => {
    // The trap that classified mono as duo: `getAttribute` returns `null`, `String(null)`
    // becomes "null", and "null" passed any "has a value" check.
    it('refuses null without turning it black', () => {
      expect(parseCssColor(null)).toBeNull()
    })

    it('refuses undefined', () => {
      expect(parseCssColor(undefined)).toBeNull()
    })

    it('refuses the literal string "null"', () => {
      expect(parseCssColor('null')).toBeNull()
    })

    it('refuses empty and whitespace-only strings', () => {
      expect(parseCssColor('')).toBeNull()
      expect(parseCssColor('   ')).toBeNull()
    })
  })

  describe('values that do not paint a colour', () => {
    it.each(['none', 'transparent', 'currentColor', 'inherit', 'initial', 'unset'])(
      'refuses %s',
      (value) => {
        expect(parseCssColor(value)).toBeNull()
      },
    )

    it('refuses a gradient reference', () => {
      expect(parseCssColor('url(#grad)')).toBeNull()
    })

    it('refuses a custom property, which would need the cascade evaluated', () => {
      expect(parseCssColor('var(--brand)')).toBeNull()
    })

    it('refuses junk that is not a colour', () => {
      expect(parseCssColor('not-a-color')).toBeNull()
      expect(parseCssColor('#12345')).toBeNull()
      expect(parseCssColor('#gggggg')).toBeNull()
      expect(parseCssColor('rgb(1, 2)')).toBeNull()
    })
  })

  describe('hexadecimal', () => {
    it('normalises short form and upper case', () => {
      expect(parseCssColor('#ABC')).toBe('#aabbcc')
      expect(parseCssColor('  #16DB65 ')).toBe('#16db65')
    })

    it('drops the alpha channel but treats alpha zero as no colour', () => {
      expect(parseCssColor('#16db6580')).toBe('#16db65')
      expect(parseCssColor('#16db6500')).toBeNull()
    })
  })

  describe('functional notation', () => {
    it('accepts legacy and modern rgb', () => {
      expect(parseCssColor('rgb(22, 219, 101)')).toBe('#16db65')
      expect(parseCssColor('rgb(22 219 101)')).toBe('#16db65')
      expect(parseCssColor('rgba(22, 219, 101, 0.5)')).toBe('#16db65')
      expect(parseCssColor('rgb(22 219 101 / 50%)')).toBe('#16db65')
    })

    it('accepts percentages in rgb', () => {
      expect(parseCssColor('rgb(100%, 0%, 0%)')).toBe('#ff0000')
    })

    it('converts hsl', () => {
      expect(parseCssColor('hsl(0, 100%, 50%)')).toBe('#ff0000')
      expect(parseCssColor('hsl(120deg 100% 25%)')).toBe('#008000')
    })

    it('treats alpha zero as no colour', () => {
      expect(parseCssColor('rgba(255, 0, 0, 0)')).toBeNull()
    })

    it('refuses a nested function instead of guessing', () => {
      expect(parseCssColor('rgb(calc(1 + 1), 0, 0)')).toBeNull()
    })
  })

  describe('CSS names', () => {
    it.each([
      ['black', '#000000'],
      ['White', '#ffffff'],
      ['REBECCAPURPLE', '#663399'],
    ])('resolves %s', (name, hex) => {
      expect(parseCssColor(name)).toBe(hex)
    })
  })
})
