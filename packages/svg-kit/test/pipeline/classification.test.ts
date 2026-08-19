import { describe, expect, it } from 'vitest'
import { importSvg, type MarkKind, type MarkMode } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function importFixture(name: string) {
  const result = importSvg(loadFixture(name), dom)
  if (!result) throw new Error(`fixture ${name} did not parse`)
  return result
}

/**
 * The table from the brief. Each row is a different way a design tool hid the colour; the
 * classifier has to reach the same conclusion in all of them.
 */
describe('classification and default mode', () => {
  it.each<[string, MarkKind, MarkMode]>([
    ['mono-fill-on-group.svg', 'mono', 'theme'],
    ['mono-css-class.svg', 'mono', 'theme'],
    ['mono-inline-style.svg', 'mono', 'theme'],
    ['mono-implicit-black.svg', 'mono', 'theme'],
    ['duo.svg', 'duo', 'theme'],
    ['multi.svg', 'multi', 'original'],
    ['embedded-image.svg', 'raster', 'original'],
  ])('%s → %s (%s)', (fixture, kind, mode) => {
    const result = importFixture(fixture)

    expect(result.analysis.kind).toBe(kind)
    expect(result.mode).toBe(mode)
  })
})

describe('palette', () => {
  it('counts a single colour when fill sits on a parent <g>', () => {
    expect(importFixture('mono-fill-on-group.svg').analysis.palette).toEqual(['#000000'])
  })

  it('counts the implicit black of anything not declaring fill', () => {
    const { analysis } = importFixture('mono-implicit-black.svg')

    expect(analysis.palette).toEqual(['#000000'])
    expect(analysis.counts['#000000']).toBe(2)
  })

  it('orders by dominance: the most used colour becomes the brand', () => {
    const { analysis } = importFixture('duo.svg')

    expect(analysis.palette).toEqual(['#1d4ed8', '#f59e0b'])
  })

  it('does not recolour a three-colour logo', () => {
    const { analysis, mode } = importFixture('multi.svg')

    expect(analysis.palette).toHaveLength(3)
    expect(mode).toBe('original')
  })
})

describe('warnings', () => {
  it('flags an embedded image', () => {
    const { analysis } = importFixture('embedded-image.svg')

    expect(analysis.warnings.map((w) => w.code)).toContain('embedded-raster')
  })

  it('flags a gradient and a missing viewBox', () => {
    const { analysis } = importFixture('gradient-no-viewbox.svg')

    expect(analysis.warnings.map((w) => w.code)).toEqual(
      expect.arrayContaining(['gradient', 'missing-viewbox']),
    )
    // A colour coming from a gradient does not enter the palette — there is no hex to swap.
    expect(analysis.palette).toEqual([])
  })
})

describe('aspect ratio', () => {
  it('reads the ratio from the viewBox', () => {
    const result = importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><path d="M0 0h1v1H0z"/></svg>',
      dom,
    )

    expect(result?.analysis.aspect).toBe(3)
  })

  it('falls back to 1 when the viewBox is missing or invalid', () => {
    expect(importFixture('gradient-no-viewbox.svg').analysis.aspect).toBe(1)

    const broken = importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 40"><path d="M0 0h1v1H0z"/></svg>',
      dom,
    )
    expect(broken?.analysis.aspect).toBe(1)
  })
})
