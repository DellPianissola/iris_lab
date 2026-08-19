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
  it('leaves the selection alone when another one is removed', () => {
    expect(selectionAfterRemoval(marks, 'c', 'b')).toBe('b')
  })

  // The bug that motivated this function: the selection moved two places because the
  // calculation lived inside the setMarks updater, which StrictMode invokes twice.
  it('falls back to the previous one when the selected is removed', () => {
    expect(selectionAfterRemoval(marks, 'c', 'c')).toBe('b')
  })

  it('falls back to the previous one even when removing the last', () => {
    expect(selectionAfterRemoval(marks, 'd', 'd')).toBe('c')
  })

  it('falls forward when there is no previous one', () => {
    expect(selectionAfterRemoval(marks, 'a', 'a')).toBe('b')
  })

  it('is idempotent — applying it twice gives the same result', () => {
    const once = selectionAfterRemoval(marks, 'c', 'c')
    expect(selectionAfterRemoval(marks, 'c', once)).toBe(once)
  })

  it('does not break on an id that does not exist', () => {
    expect(selectionAfterRemoval(marks, 'zzz', 'b')).toBe('b')
    expect(selectionAfterRemoval([], 'a', 'a')).toBe('a')
  })

  it('keeps the selection when only the removed one remains', () => {
    expect(selectionAfterRemoval([mark('só')], 'só', 'só')).toBe('só')
  })
})

describe('markById', () => {
  it('finds by id', () => {
    expect(markById(marks, 'c')?.id).toBe('c')
  })

  it('falls back to the first when the id is gone from the list', () => {
    expect(markById(marks, 'apagado')?.id).toBe('a')
  })

  it('returns undefined for an empty list', () => {
    expect(markById([], 'a')).toBeUndefined()
  })
})
