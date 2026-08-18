import { describe, expect, it } from 'vitest'
import { normalizeSvg, sanitizeSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function normalize(markup: string): SVGElement {
  const svg = sanitizeSvg(markup, dom)
  if (!svg) throw new Error('fixture não parseou')
  return normalizeSvg(svg)
}

function fillOf(svg: SVGElement, selector: string): string | null {
  return svg.querySelector(selector)?.getAttribute('fill') ?? null
}

describe('normalizeSvg — cascata', () => {
  // Em SVG o atributo de apresentação tem especificidade zero: qualquer regra CSS o vence.
  // O protótipo fazia o contrário, e Illustrator emite esse par com frequência.
  it('folha de estilo vence atributo de apresentação', () => {
    const svg = normalize(loadFixture('css-beats-attribute.svg'))

    expect(fillOf(svg, 'path')).toBe('#231F20')
  })

  // Em CSS, com especificidade igual, vence a última regra. O protótipo escrevia só quando
  // o atributo estava ausente, então vencia a primeira.
  it('entre regras de mesma especificidade vence a última', () => {
    const svg = normalize(loadFixture('css-rule-order.svg'))

    expect(fillOf(svg, 'path')).toBe('#00ff00')
  })

  it('especificidade maior vence ordem', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>path.st0{fill:#111111} .st0{fill:#222222}</style>
        <path class="st0" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#111111')
  })

  it('style inline vence folha sem important', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>.st0{fill:#111111}</style>
        <path class="st0" style="fill:#333333" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#333333')
  })

  it('important na folha vence inline sem important', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>.st0{fill:#111111 !important}</style>
        <path class="st0" style="fill:#333333" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#111111')
  })

  it('remove os <style> depois de colapsar as regras', () => {
    const svg = normalize(loadFixture('mono-css-class.svg'))

    expect(svg.querySelector('style')).toBeNull()
    expect(fillOf(svg, 'path')).toBe('#231F20')
  })

  it('colapsa style inline em atributo', () => {
    const svg = normalize(loadFixture('mono-inline-style.svg'))
    const path = svg.querySelector('path')

    expect(path?.getAttribute('fill')).toBe('#0a0a0a')
    expect(path?.getAttribute('style')).toBeFalsy()
  })

  it('ignora seletor que o navegador recusaria', () => {
    const svg = normalize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <style>::: {fill:red} .st0{fill:#444444}</style>
        <path class="st0" d="M0 0h10v10H0z"/>
      </svg>
    `)

    expect(fillOf(svg, 'path')).toBe('#444444')
  })
})
