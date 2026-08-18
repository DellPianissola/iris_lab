import { describe, expect, it } from 'vitest'
import { importSvg, type MarkKind, type MarkMode } from '../../src/index'
import { loadFixture, testDom } from '../helpers'

const dom = testDom()

function importFixture(name: string) {
  const result = importSvg(loadFixture(name), dom)
  if (!result) throw new Error(`fixture ${name} não parseou`)
  return result
}

/**
 * A tabela do briefing. Cada linha é um jeito diferente de a ferramenta de design ter
 * escondido a cor; o classificador precisa chegar na mesma conclusão em todos.
 */
describe('classificação e modo padrão', () => {
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

describe('paleta', () => {
  it('conta uma cor só quando o fill mora num <g> pai', () => {
    expect(importFixture('mono-fill-on-group.svg').analysis.palette).toEqual(['#000000'])
  })

  it('conta o preto implícito de quem não declara fill', () => {
    const { analysis } = importFixture('mono-implicit-black.svg')

    expect(analysis.palette).toEqual(['#000000'])
    expect(analysis.counts['#000000']).toBe(2)
  })

  it('ordena por dominância: a cor mais usada vira a marca', () => {
    const { analysis } = importFixture('duo.svg')

    expect(analysis.palette).toEqual(['#1d4ed8', '#f59e0b'])
  })

  it('não recolore logo de três cores', () => {
    const { analysis, mode } = importFixture('multi.svg')

    expect(analysis.palette).toHaveLength(3)
    expect(mode).toBe('original')
  })
})

describe('avisos', () => {
  it('sinaliza imagem embutida', () => {
    const { analysis } = importFixture('embedded-image.svg')

    expect(analysis.warnings.map((w) => w.code)).toContain('embedded-raster')
  })

  it('sinaliza gradiente e viewBox ausente', () => {
    const { analysis } = importFixture('gradient-no-viewbox.svg')

    expect(analysis.warnings.map((w) => w.code)).toEqual(
      expect.arrayContaining(['gradient', 'missing-viewbox']),
    )
    // Cor que vem de gradiente não entra na paleta — não há hex para trocar.
    expect(analysis.palette).toEqual([])
  })
})

describe('proporção', () => {
  it('lê a razão do viewBox', () => {
    const result = importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><path d="M0 0h1v1H0z"/></svg>',
      dom,
    )

    expect(result?.analysis.aspect).toBe(3)
  })

  it('cai em 1 quando o viewBox falta ou é inválido', () => {
    expect(importFixture('gradient-no-viewbox.svg').analysis.aspect).toBe(1)

    const broken = importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 40"><path d="M0 0h1v1H0z"/></svg>',
      dom,
    )
    expect(broken?.analysis.aspect).toBe(1)
  })
})
