import { describe, expect, it } from 'vitest'
import { classifyRaster, inspectRasterPixels } from '../../src/index'
import { pixels } from '../helpers'

const TOTAL = 100

describe('inspectRasterPixels', () => {
  it('detecta PNG sem transparência', () => {
    const data = pixels([10, 10, 10, 255, TOTAL])

    expect(inspectRasterPixels(data).opaque).toBe(true)
  })

  it('detecta recorte transparente', () => {
    const data = pixels([0, 0, 0, 0, 50], [10, 10, 10, 255, 50])

    expect(inspectRasterPixels(data).opaque).toBe(false)
  })

  it('agrupa tons vizinhos numa cor só, para ruído de compressão não virar cor nova', () => {
    const data = pixels([0, 0, 0, 0, 50], [10, 10, 10, 255, 25], [12, 12, 12, 255, 25])

    expect(inspectRasterPixels(data).colors).toHaveLength(1)
  })

  it('descarta cor que ocupa área insignificante', () => {
    const data = pixels([0, 0, 0, 0, 50], [10, 10, 10, 255, 49], [255, 0, 0, 255, 1])

    expect(inspectRasterPixels(data).colors).toHaveLength(1)
  })

  it('ordena as cores por dominância', () => {
    const data = pixels([0, 0, 0, 0, 40], [255, 0, 0, 255, 40], [0, 0, 255, 255, 20])
    const { colors } = inspectRasterPixels(data)

    expect(colors).toHaveLength(2)
    expect(colors[0]).toMatch(/^#f/)
  })
})

describe('classifyRaster', () => {
  it('PNG opaco: bloqueia colorir e avisa', () => {
    const result = classifyRaster({ opaque: true, colors: ['#101010'] })

    expect(result.kind).toBe('raster-opaque')
    expect(result.mode).toBe('original')
    expect(result.warnings.map((w) => w.code)).toEqual(['opaque-raster'])
  })

  it('PNG de uma cor com alfa: colore por máscara', () => {
    const result = classifyRaster({ opaque: false, colors: ['#101010'] })

    expect(result.kind).toBe('mono')
    expect(result.mode).toBe('theme')
    expect(result.warnings).toEqual([])
  })

  it('PNG colorido com alfa: mantém as cores originais', () => {
    const result = classifyRaster({ opaque: false, colors: ['#101010', '#ff0000', '#0000ff'] })

    expect(result.kind).toBe('multi')
    expect(result.mode).toBe('original')
  })
})
