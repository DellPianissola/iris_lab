import { contrastRatio } from '@nomai/color'
import { describe, expect, it } from 'vitest'
import {
  CONTRAST_TARGETS,
  brandPalette,
  buildTokens,
  deriveNeutrals,
  harmonizeAccent,
  presets,
  randomPalette,
  tokensToCssText,
  tokensToCssVars,
} from '../src/index'

describe('buildTokens', () => {
  it('mantém os sete editáveis e acrescenta os quatro derivados', () => {
    const tokens = buildTokens(brandPalette('light'))

    expect(tokens.brand).toBe('#16db65')
    expect(Object.keys(tokens)).toEqual(
      expect.arrayContaining(['onBrand', 'onAccent', 'brandSoft', 'brandInk']),
    )
  })

  it('nunca põe texto branco em cima do verde da marca', () => {
    expect(buildTokens(brandPalette('light')).onBrand).toBe('#111111')
  })

  // O motivo de o brandInk existir: a marca crua sobre a pílula é ilegível.
  it('garante que brandInk é legível sobre brandSoft', () => {
    for (const preset of presets) {
      const tokens = buildTokens(preset.colors)

      expect(contrastRatio(tokens.brandInk, tokens.brandSoft)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.text,
      )
    }
  })

  it('vale também para paleta sorteada', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const tokens = buildTokens(randomPalette(seed % 2 === 0 ? 'light' : 'dark'))

      expect(contrastRatio(tokens.brandInk, tokens.brandSoft)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.text,
      )
      expect(contrastRatio(tokens.onBrand, tokens.brand)).toBeGreaterThanOrEqual(
        CONTRAST_TARGETS.largeText,
      )
    }
  })
})

describe('tokensToCssVars', () => {
  it('exporta os onze tokens, não só os sete editáveis', () => {
    const vars = tokensToCssVars(buildTokens(brandPalette('light')))

    expect(Object.keys(vars)).toHaveLength(11)
    expect(vars['--c-brand-ink']).toBeDefined()
    expect(vars['--c-on-brand']).toBeDefined()
  })
})

describe('tokensToCssText', () => {
  it('gera bloco :root colável, com os derivados incluídos', () => {
    const css = tokensToCssText(buildTokens(brandPalette('light')), 'paleta atual')

    expect(css).toContain('/* paleta atual */')
    expect(css).toContain(':root {')
    expect(css).toContain('--c-brand: #16db65;')
    // O protótipo exportava só os sete: o CSS baixado não reproduzia o que o cliente viu.
    expect(css).toContain('--c-brand-soft:')
    expect(css).toContain('--c-brand-ink:')
  })
})

describe('deriveNeutrals', () => {
  it('produz fundo claro no modo claro e escuro no modo escuro', () => {
    expect(deriveNeutrals('#16db65', 'light').bg).not.toBe(deriveNeutrals('#16db65', 'dark').bg)
    expect(contrastRatio(deriveNeutrals('#16db65', 'light').text, deriveNeutrals('#16db65', 'light').bg))
      .toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('mantém texto legível sobre o fundo em qualquer matiz', () => {
    for (let hue = 0; hue < 360; hue += 30) {
      for (const mode of ['light', 'dark'] as const) {
        const neutrals = deriveNeutrals(hueToHex(hue), mode)
        expect(contrastRatio(neutrals.text, neutrals.bg)).toBeGreaterThanOrEqual(
          CONTRAST_TARGETS.text,
        )
      }
    }
  })
})

describe('harmonizeAccent', () => {
  it('é determinístico quando o sorteio é injetado', () => {
    const fixed = () => 0.5
    expect(harmonizeAccent('#16db65', 'light', fixed)).toBe(
      harmonizeAccent('#16db65', 'light', fixed),
    )
  })

  it('afasta o acento da marca', () => {
    const accent = harmonizeAccent('#16db65', 'light', () => 0.5)
    expect(accent).not.toBe('#16db65')
  })
})

function hueToHex(hue: number): string {
  const chroma = 0.6
  const lightness = 0.5
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const planes: [number, number, number][] = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x], [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ]
  const plane = planes[Math.floor(hue / 60) % 6] ?? [chroma, x, 0]
  const lift = lightness - chroma / 2
  const channel = (v: number) => Math.round((v + lift) * 255).toString(16).padStart(2, '0')
  return `#${channel(plane[0])}${channel(plane[1])}${channel(plane[2])}`
}
