import { describe, expect, it } from 'vitest'
import type { Mark } from '../src/marks/types'
import { markById, selectionAfterRemoval } from '../src/state/selection'

function mark(id: string, builtin = false): Mark {
  return {
    type: 'svg',
    id,
    name: id,
    builtin,
    aspect: 1,
    kind: 'mono',
    palette: [],
    warnings: [],
    mode: 'theme',
    original: '<svg/>',
    themed: '<svg/>',
  }
}

const marks = [mark('a', true), mark('b'), mark('c'), mark('d')]

describe('selectionAfterRemoval', () => {
  it('não mexe na seleção quando o removido é outro', () => {
    expect(selectionAfterRemoval(marks, 'c', 'b')).toBe('b')
  })

  // O bug que motivou esta função: a seleção andava duas casas porque o cálculo vivia
  // dentro do updater de setMarks, que o StrictMode invoca duas vezes.
  it('cai no anterior quando o selecionado é removido', () => {
    expect(selectionAfterRemoval(marks, 'c', 'c')).toBe('b')
  })

  it('cai no anterior mesmo removendo o último', () => {
    expect(selectionAfterRemoval(marks, 'd', 'd')).toBe('c')
  })

  it('cai no seguinte quando não há anterior', () => {
    expect(selectionAfterRemoval(marks, 'a', 'a')).toBe('b')
  })

  it('é idempotente — aplicar duas vezes dá o mesmo resultado', () => {
    const once = selectionAfterRemoval(marks, 'c', 'c')
    expect(selectionAfterRemoval(marks, 'c', once)).toBe(once)
  })

  it('não quebra com id que não existe', () => {
    expect(selectionAfterRemoval(marks, 'zzz', 'b')).toBe('b')
    expect(selectionAfterRemoval([], 'a', 'a')).toBe('a')
  })

  it('mantém a seleção quando só resta o removido', () => {
    expect(selectionAfterRemoval([mark('só')], 'só', 'só')).toBe('só')
  })
})

describe('markById', () => {
  it('encontra pelo id', () => {
    expect(markById(marks, 'c')?.id).toBe('c')
  })

  it('cai no primeiro quando o id sumiu da lista', () => {
    expect(markById(marks, 'apagado')?.id).toBe('a')
  })

  it('devolve undefined com a lista vazia', () => {
    expect(markById([], 'a')).toBeUndefined()
  })
})
