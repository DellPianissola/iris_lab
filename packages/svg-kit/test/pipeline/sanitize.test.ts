import { describe, expect, it } from 'vitest'
import { importSvg, sanitizeSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

describe('sanitizeSvg', () => {
  const malicious = loadFixture('malicious.svg')

  it('remove script, foreignObject e handlers, e não executa nada', () => {
    const globals = globalThis as { __pwned?: boolean }
    const svg = sanitizeSvg(malicious, dom)

    expect(svg).not.toBeNull()
    expect(svg?.querySelector('script')).toBeNull()
    expect(svg?.querySelector('foreignObject')).toBeNull()
    expect(svg?.getAttribute('onload')).toBeNull()
    expect(svg?.querySelector('[onclick]')).toBeNull()
    expect(globals.__pwned).toBeUndefined()
  })

  it('descarta href externo e javascript:, preservando o desenho', () => {
    const result = importSvg(malicious, dom)

    expect(result).not.toBeNull()
    expect(result?.original).not.toContain('evil.example')
    expect(result?.original).not.toContain('javascript:')
    // O desenho sobrevive à limpeza: a regra interna ainda pinta o path.
    expect(result?.analysis.palette).toEqual(['#111111'])
  })

  it('remove @import, que buscaria CSS de fora', () => {
    const svg = sanitizeSvg(malicious, dom)

    expect(svg?.querySelector('style')?.textContent ?? '').not.toContain('@import')
  })

  it('mantém imagem embutida em data: de bitmap', () => {
    const svg = sanitizeSvg(loadFixture('embedded-image.svg'), dom)

    expect(svg?.querySelector('image')?.getAttribute('href')).toMatch(/^data:image\/png;/)
  })

  it('descarta data:image/svg+xml, que poderia aninhar script', () => {
    const svg = sanitizeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
         <image href="data:image/svg+xml;base64,AAAA"/>
       </svg>`,
      dom,
    )

    expect(svg?.querySelector('image')?.getAttribute('href')).toBeNull()
  })

  it('devolve null para arquivo que não é SVG', () => {
    expect(sanitizeSvg('isto não é um svg', dom)).toBeNull()
    expect(importSvg('<html><body>oi</body></html>', dom)).toBeNull()
  })

  it('remove width e height fixos, deixando o viewBox mandar', () => {
    const svg = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"/>',
      dom,
    )

    expect(svg?.getAttribute('width')).toBeNull()
    expect(svg?.getAttribute('height')).toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 120 40')
  })
})
