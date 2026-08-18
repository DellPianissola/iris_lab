import { describe, expect, it } from 'vitest'
import { importSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function themed(fixture: string): string {
  const result = importSvg(loadFixture(fixture), dom)
  if (!result) throw new Error(`fixture ${fixture} não parseou`)
  return result.themed
}

describe('buildThemedSvg', () => {
  it('injeta a folha com !important dentro do próprio SVG', () => {
    const markup = themed('mono-css-class.svg')

    expect(markup).toContain('.__f0{fill:var(--tone-0,currentColor)!important}')
    expect(markup).toContain('.__f1{fill:var(--tone-1,currentColor)!important}')
  })

  it('dá tom 0 à cor dominante e tom 1 à segunda', () => {
    const svg = dom.parse(themed('duo.svg')).querySelector('svg')

    expect(svg?.querySelectorAll('.__f0')).toHaveLength(3)
    expect(svg?.querySelectorAll('.__f1')).toHaveLength(1)
  })

  it('marca também quem só tinha o preto implícito', () => {
    const svg = dom.parse(themed('mono-implicit-black.svg')).querySelector('svg')

    expect(svg?.querySelectorAll('.__f0')).toHaveLength(2)
  })

  it('marca o elemento que herdou a cor do <g> pai', () => {
    const svg = dom.parse(themed('mono-fill-on-group.svg')).querySelector('svg')

    expect(svg?.querySelector('g')?.classList.contains('__f0')).toBe(true)
  })

  it('colapsa cor fora dos dois tons dominantes no tom da marca', () => {
    const svg = dom.parse(themed('multi.svg')).querySelector('svg')

    // Três cores, dois tons: a terceira cai no tom 0 — recolorir é tudo ou nada.
    expect(svg?.querySelectorAll('.__f0')).toHaveLength(2)
    expect(svg?.querySelectorAll('.__f1')).toHaveLength(1)
  })

  it('não altera o markup original', () => {
    const result = importSvg(loadFixture('duo.svg'), dom)

    expect(result?.original).not.toContain('__f0')
    expect(result?.original).toContain('#1D4ED8')
  })
})
