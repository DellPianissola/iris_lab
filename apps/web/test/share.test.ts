import { brandPalette } from '@nomai/theme'
import { describe, expect, it } from 'vitest'
import { decodeShare, encodeShare, isCompletePalette } from '../src/state/share'

const palette = brandPalette('light')

describe('encodeShare', () => {
  it('carries the seven tokens and the mode', () => {
    const params = new URLSearchParams(encodeShare(palette, 'dark'))

    expect(params.get('brand')).toBe('16db65')
    expect(params.get('mode')).toBe('dark')
    expect([...params.keys()]).toHaveLength(8)
  })

  it('writes the hex without the "#"', () => {
    expect(encodeShare(palette, 'light')).not.toContain('%23')
  })
})

describe('decodeShare', () => {
  it('round-trips completely', () => {
    const { palette: back, mode } = decodeShare(`#${encodeShare(palette, 'dark')}`)

    expect(back).toEqual(palette)
    expect(mode).toBe('dark')
  })

  it('accepts the hash with or without the "#"', () => {
    const hash = encodeShare(palette, 'light')
    expect(decodeShare(hash)).toEqual(decodeShare(`#${hash}`))
  })

  // A link truncated by a messaging app is the common case; discarding only the corrupted
  // token keeps the rest usable, which is why the parameters are named.
  it('discards an invalid value without taking the others down', () => {
    const { palette: back } = decodeShare('#brand=16db65&accent=xyz&bg=zzzzzz')

    expect(back.brand).toBe('#16db65')
    expect(back.accent).toBeUndefined()
    expect(back.bg).toBeUndefined()
  })

  it('ignores an unknown mode', () => {
    expect(decodeShare('#mode=sepia').mode).toBeUndefined()
  })

  it('returns empty for a missing or junk hash', () => {
    expect(decodeShare('')).toEqual({ palette: {} })
    expect(decodeShare('#').palette).toEqual({})
    expect(decodeShare('#qualquercoisa').palette).toEqual({})
  })

  it('normalises the hex case', () => {
    expect(decodeShare('#brand=16DB65').palette.brand).toBe('#16db65')
  })
})

describe('isCompletePalette', () => {
  it('requires all seven tokens', () => {
    expect(isCompletePalette(palette)).toBe(true)
    expect(isCompletePalette({ brand: '#16db65' })).toBe(false)

    const { line: _line, ...faltandoUm } = palette
    expect(isCompletePalette(faltandoUm)).toBe(false)
  })
})
