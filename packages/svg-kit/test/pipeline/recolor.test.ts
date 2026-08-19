import { describe, expect, it } from 'vitest'
import { importSvg } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function themed(fixture: string): string {
  const result = importSvg(loadFixture(fixture), dom)
  if (!result) throw new Error(`fixture ${fixture} did not parse`)
  return result.themed
}

describe('buildThemedSvg', () => {
  it('injects the sheet with !important inside the SVG itself', () => {
    const markup = themed('mono-css-class.svg')

    expect(markup).toContain('.__f0{fill:var(--tone-0,currentColor)!important}')
    expect(markup).toContain('.__f1{fill:var(--tone-1,currentColor)!important}')
  })

  it('gives tone 0 to the dominant colour and tone 1 to the second', () => {
    const svg = dom.parse(themed('duo.svg')).querySelector('svg')

    expect(svg?.querySelectorAll('.__f0')).toHaveLength(3)
    expect(svg?.querySelectorAll('.__f1')).toHaveLength(1)
  })

  it('also tags what only had the implicit black', () => {
    const svg = dom.parse(themed('mono-implicit-black.svg')).querySelector('svg')

    expect(svg?.querySelectorAll('.__f0')).toHaveLength(2)
  })

  it('tags the element that inherited colour from the parent <g>', () => {
    const svg = dom.parse(themed('mono-fill-on-group.svg')).querySelector('svg')

    expect(svg?.querySelector('g')?.classList.contains('__f0')).toBe(true)
  })

  it('collapses a colour outside the two dominant tones into the brand tone', () => {
    const svg = dom.parse(themed('multi.svg')).querySelector('svg')

    // Three colours, two tones: the third falls to tone 0 — recolouring is all or nothing.
    expect(svg?.querySelectorAll('.__f0')).toHaveLength(2)
    expect(svg?.querySelectorAll('.__f1')).toHaveLength(1)
  })

  it('leaves the original markup untouched', () => {
    const result = importSvg(loadFixture('duo.svg'), dom)

    expect(result?.original).not.toContain('__f0')
    expect(result?.original).toContain('#1D4ED8')
  })
})
