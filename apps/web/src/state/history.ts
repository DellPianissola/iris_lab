/**
 * Histórico de desfazer/refazer. Genérico e puro — o estado que ele guarda é problema de
 * quem o usa.
 *
 * A chave de coalescência existe por causa do seletor de cor: arrastar produz dezenas de
 * valores por segundo, e cada um virar um passo tornaria o desfazer inútil. Gravações
 * seguidas **com a mesma chave** ocupam um passo só; trocar de chave abre um passo novo,
 * então ajustar o acento e depois as bordas continua sendo duas coisas desfazíveis
 * separadamente. A primeira gravação de cada chave sempre empilha, para que o estado
 * anterior ao gesto continue alcançável.
 */

/** Passos guardados. Acima disso o começo é descartado — memória não cresce sem fim. */
const MAX_DEPTH = 50

export interface History<T> {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
  /** Chave do último gesto; `null` quando a próxima gravação tem de empilhar. */
  readonly coalesceKey: string | null
}

export function initHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], coalesceKey: null }
}

export function record<T>(history: History<T>, next: T, coalesceKey: string | null = null): History<T> {
  if (coalesceKey !== null && coalesceKey === history.coalesceKey) {
    // Substitui o topo: continua sendo o mesmo gesto do usuário.
    return { ...history, present: next, future: [] }
  }

  return {
    past: [...history.past, history.present].slice(-MAX_DEPTH),
    present: next,
    // Refazer só faz sentido enquanto ninguém escreveu por cima do ramo abandonado.
    future: [],
    coalesceKey,
  }
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1)
  if (previous === undefined) return history

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    coalesceKey: null,
  }
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future
  if (next === undefined) return history

  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
    coalesceKey: null,
  }
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0
}
