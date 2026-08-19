import { describe, expect, it } from 'vitest'
import { canRedo, canUndo, initHistory, record, redo, undo } from '../src/state/history'

const start = initHistory('a')

describe('history', () => {
  it('começa sem passado nem futuro', () => {
    expect(canUndo(start)).toBe(false)
    expect(canRedo(start)).toBe(false)
    expect(start.present).toBe('a')
  })

  it('grava e volta', () => {
    const h = record(record(start, 'b'), 'c')

    expect(h.present).toBe('c')
    expect(undo(h).present).toBe('b')
    expect(undo(undo(h)).present).toBe('a')
  })

  it('refaz o que foi desfeito', () => {
    const h = undo(record(start, 'b'))

    expect(canRedo(h)).toBe(true)
    expect(redo(h).present).toBe('b')
  })

  it('descarta o futuro ao gravar sobre um desfazer', () => {
    const desfeito = undo(record(record(start, 'b'), 'c'))
    const novoRamo = record(desfeito, 'x')

    expect(novoRamo.present).toBe('x')
    expect(canRedo(novoRamo)).toBe(false)
    expect(undo(novoRamo).present).toBe('b')
  })

  it('não quebra ao desfazer ou refazer no limite', () => {
    expect(undo(start)).toBe(start)
    expect(redo(start)).toBe(start)
  })

  describe('coalescência por chave', () => {
    // O seletor de cor emite dezenas de valores por arrasto; cada um virando um passo
    // tornaria o desfazer inútil.
    it('junta uma sequência da mesma chave num passo só', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c', 'brand')
      h = record(h, 'd', 'brand')

      expect(h.present).toBe('d')
      expect(undo(h).present).toBe('a')
    })

    // A primeira do arrasto ainda empilha, senão o estado anterior some.
    it('preserva o estado anterior ao início do arrasto', () => {
      const antes = record(start, 'sorteada')
      const arrastando = record(record(antes, 'x', 'brand'), 'y', 'brand')

      expect(undo(arrastando).present).toBe('sorteada')
    })

    // O bug que motivou a chave: sem ela, ajustar acento e depois bordas colapsava num
    // passo só, e um desfazer apagava as duas edições.
    it('trocar de chave abre um passo novo', () => {
      let h = record(start, 'acento', 'accent')
      h = record(h, 'bordas', 'line')

      expect(undo(h).present).toBe('acento')
      expect(undo(undo(h)).present).toBe('a')
    })

    it('voltar à chave anterior também abre passo novo', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c', 'accent')
      h = record(h, 'd', 'brand')

      expect(undo(h).present).toBe('c')
    })

    it('uma gravação sem chave encerra a sequência', () => {
      let h = record(start, 'b', 'brand')
      h = record(h, 'c')
      h = record(h, 'd', 'brand')

      expect(undo(h).present).toBe('c')
      expect(undo(undo(h)).present).toBe('b')
    })

    it('desfazer encerra a coalescência', () => {
      const h = undo(record(start, 'b', 'brand'))
      expect(h.coalesceKey).toBeNull()
    })
  })

  it('descarta o começo em vez de crescer sem fim', () => {
    let h = initHistory(0)
    for (let i = 1; i <= 80; i += 1) h = record(h, i)

    expect(h.past.length).toBeLessThanOrEqual(50)
    expect(h.present).toBe(80)
  })
})
