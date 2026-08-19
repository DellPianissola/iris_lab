import { brandPalette } from '@nomai/theme'
import { describe, expect, it } from 'vitest'
import { decodeShare, encodeShare, isCompletePalette } from '../src/state/share'

const palette = brandPalette('light')

describe('encodeShare', () => {
  it('leva os sete tokens e o modo', () => {
    const params = new URLSearchParams(encodeShare(palette, 'dark'))

    expect(params.get('brand')).toBe('16db65')
    expect(params.get('mode')).toBe('dark')
    expect([...params.keys()]).toHaveLength(8)
  })

  it('grava o hex sem o "#"', () => {
    expect(encodeShare(palette, 'light')).not.toContain('%23')
  })
})

describe('decodeShare', () => {
  it('faz a volta completa', () => {
    const { palette: back, mode } = decodeShare(`#${encodeShare(palette, 'dark')}`)

    expect(back).toEqual(palette)
    expect(mode).toBe('dark')
  })

  it('aceita o hash com ou sem "#"', () => {
    const hash = encodeShare(palette, 'light')
    expect(decodeShare(hash)).toEqual(decodeShare(`#${hash}`))
  })

  // Link truncado por app de mensagem é o caso comum; descartar só o token corrompido
  // mantém o resto utilizável, que é a razão de os parâmetros serem nomeados.
  it('descarta valor inválido sem derrubar os outros', () => {
    const { palette: back } = decodeShare('#brand=16db65&accent=xyz&bg=zzzzzz')

    expect(back.brand).toBe('#16db65')
    expect(back.accent).toBeUndefined()
    expect(back.bg).toBeUndefined()
  })

  it('ignora modo desconhecido', () => {
    expect(decodeShare('#mode=sepia').mode).toBeUndefined()
  })

  it('devolve vazio para hash ausente ou lixo', () => {
    expect(decodeShare('')).toEqual({ palette: {} })
    expect(decodeShare('#').palette).toEqual({})
    expect(decodeShare('#qualquercoisa').palette).toEqual({})
  })

  it('normaliza a caixa do hex', () => {
    expect(decodeShare('#brand=16DB65').palette.brand).toBe('#16db65')
  })
})

describe('isCompletePalette', () => {
  it('exige os sete tokens', () => {
    expect(isCompletePalette(palette)).toBe(true)
    expect(isCompletePalette({ brand: '#16db65' })).toBe(false)

    const { line: _line, ...faltandoUm } = palette
    expect(isCompletePalette(faltandoUm)).toBe(false)
  })
})
