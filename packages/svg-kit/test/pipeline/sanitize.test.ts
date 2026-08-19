import { describe, expect, it } from 'vitest'
import { importSvg, sanitizeSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

describe('sanitizeSvg', () => {
  const malicious = loadFixture('malicious.svg')

  it('removes script, foreignObject and handlers, and runs nothing', () => {
    const globals = globalThis as { __pwned?: boolean }
    const svg = sanitizeSvg(malicious, dom)

    expect(svg).not.toBeNull()
    expect(svg?.querySelector('script')).toBeNull()
    expect(svg?.querySelector('foreignObject')).toBeNull()
    expect(svg?.getAttribute('onload')).toBeNull()
    expect(svg?.querySelector('[onclick]')).toBeNull()
    expect(globals.__pwned).toBeUndefined()
  })

  it('discards external and javascript: hrefs while preserving the drawing', () => {
    const result = importSvg(malicious, dom)

    expect(result).not.toBeNull()
    expect(result?.original).not.toContain('evil.example')
    expect(result?.original).not.toContain('javascript:')
    // The drawing survives the cleanup: the internal rule still paints the path.
    expect(result?.analysis.palette).toEqual(['#111111'])
  })

  it('removes @import, which would fetch CSS from outside', () => {
    const svg = sanitizeSvg(malicious, dom)

    expect(svg?.querySelector('style')?.textContent ?? '').not.toContain('@import')
  })

  it('keeps an embedded bitmap data: image', () => {
    const svg = sanitizeSvg(loadFixture('embedded-image.svg'), dom)

    expect(svg?.querySelector('image')?.getAttribute('href')).toMatch(/^data:image\/png;/)
  })

  it('discards data:image/svg+xml, which could nest script', () => {
    const svg = sanitizeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
         <image href="data:image/svg+xml;base64,AAAA"/>
       </svg>`,
      dom,
    )

    expect(svg?.querySelector('image')?.getAttribute('href')).toBeNull()
  })

  it('returns null for a file that is not SVG', () => {
    expect(sanitizeSvg('isto não é um svg', dom)).toBeNull()
    expect(importSvg('<html><body>oi</body></html>', dom)).toBeNull()
  })

  it('removes fixed width and height, letting the viewBox decide', () => {
    const svg = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"/>',
      dom,
    )

    expect(svg?.getAttribute('width')).toBeNull()
    expect(svg?.getAttribute('height')).toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 120 40')
  })
})
