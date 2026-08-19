import { describe, expect, it } from 'vitest'
import { normalizeSvg, sanitizeSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function normalize(markup: string): SVGElement {
  const svg = sanitizeSvg(markup, dom)
  if (!svg) throw new Error('fixture did not parse')
  return normalizeSvg(svg)
}

function fillOf(svg: SVGElement, selector: string): string | null {
  return svg.querySelector(selector)?.getAttribute('fill') ?? null
}

describe('normalizeSvg — cascade', () => {
  // In SVG a presentation attribute has specificity zero: any CSS rule beats it. The
  // prototype did the opposite, and Illustrator emits that pair often.
  it('a stylesheet beats a presentation attribute', () => {
    const svg = normalize(loadFixture('css-beats-attribute.svg'))

    expect(fillOf(svg, 'path')).toBe('#231F20')
  })

  // In CSS, with equal specificity, the last rule wins. The prototype only wrote when the
  // attribute was absent, so the first won.
  it('among rules of equal specificity the last one wins', () => {
    const svg = normalize(loadFixture('css-rule-order.svg'))

    expect(fillOf(svg, 'path')).toBe('#00ff00')
  })

  it('higher specificity beats document order', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>path.st0{fill:#111111} .st0{fill:#222222}</style>
        <path class="st0" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#111111')
  })

  it('inline style beats a stylesheet without important', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>.st0{fill:#111111}</style>
        <path class="st0" style="fill:#333333" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#333333')
  })

  it('important in the stylesheet beats inline without important', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>.st0{fill:#111111 !important}</style>
        <path class="st0" style="fill:#333333" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#111111')
  })

  it('removes the <style> elements after collapsing the rules', () => {
    const svg = normalize(loadFixture('mono-css-class.svg'))

    expect(svg.querySelector('style')).toBeNull()
    expect(fillOf(svg, 'path')).toBe('#231F20')
  })

  it('collapses inline style into an attribute', () => {
    const svg = normalize(loadFixture('mono-inline-style.svg'))
    const path = svg.querySelector('path')

    expect(path?.getAttribute('fill')).toBe('#0a0a0a')
    expect(path?.getAttribute('style')).toBeFalsy()
  })

  it('ignores a selector the browser would reject', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>::: {fill:red} .st0{fill:#444444}</style>
        <path class="st0" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#444444')
  })
})
