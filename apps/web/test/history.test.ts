import { describe, expect, it } from 'vitest'
import { canRedo, canUndo, initHistory, record, redo, undo } from '../src/state/history'

const start = initHistory('a')

describe('history', () => {
  it('starts with no past and no future', () => {
    expect(canUndo(start)).toBe(false)
    expect(canRedo(start)).toBe(false)
    expect(start.present).toBe('a')
  })

  it('records and steps back', () => {
    const h = record(record(start, 'b'), 'c')

    expect(h.present).toBe('c')
    expect(undo(h).present).toBe('b')
    expect(undo(undo(h)).present).toBe('a')
  })

  it('redoes what was undone', () => {
    const h = undo(record(start, 'b'))

    expect(canRedo(h)).toBe(true)
    expect(redo(h).present).toBe('b')
  })

  it('discards the future when recording over an undo', () => {
    const desfeito = undo(record(record(start, 'b'), 'c'))
    const novoRamo = record(desfeito, 'x')

    expect(novoRamo.present).toBe('x')
    expect(canRedo(novoRamo)).toBe(false)
    expect(undo(novoRamo).present).toBe('b')
  })

  it('does not break undoing or redoing at the boundary', () => {
    expect(undo(start)).toBe(start)
    expect(redo(start)).toBe(start)
  })

  describe('coalescing by key', () => {
    // The colour picker emits dozens of values per drag; one step each would make undo
    // useless.
    it('merges a run of the same key into one step', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c', 'brand')
      h = record(h, 'd', 'brand')

      expect(h.present).toBe('d')
      expect(undo(h).present).toBe('a')
    })

    // The first of the drag still pushes, or the previous state disappears.
    it('preserves the state from before the drag started', () => {
      const antes = record(start, 'sorteada')
      const arrastando = record(record(antes, 'x', 'brand'), 'y', 'brand')

      expect(undo(arrastando).present).toBe('sorteada')
    })

    // The bug that motivated the key: without it, adjusting the accent and then the borders
    // collapsed into one step, and a single undo erased both edits.
    it('changing key opens a new step', () => {
      let h = record(start, 'acento', 'accent')
      h = record(h, 'bordas', 'line')

      expect(undo(h).present).toBe('acento')
      expect(undo(undo(h)).present).toBe('a')
    })

    it('returning to an earlier key also opens a new step', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c', 'accent')
      h = record(h, 'd', 'brand')

      expect(undo(h).present).toBe('c')
    })

    it('a record with no key ends the run', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c')
      h = record(h, 'd', 'brand')

      expect(undo(h).present).toBe('c')
      expect(undo(undo(h)).present).toBe('b')
    })

    it('undo ends the coalescing run', () => {
      const h = undo(record(start, 'b', 'brand'))
      expect(h.coalesceKey).toBeNull()
    })
  })

  it('drops the oldest instead of growing without end', () => {
    let h = initHistory(0)
    for (let i = 1; i <= 80; i += 1) h = record(h, i)

    expect(h.past.length).toBeLessThanOrEqual(50)
    expect(h.present).toBe(80)
  })
})
