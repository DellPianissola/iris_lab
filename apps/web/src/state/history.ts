/**
 * Generic and pure — what it holds is the caller problem.
 *
 * The coalesce key exists because of the colour picker: dragging emits dozens of values a
 * second, and one step each would make undo useless. Consecutive records **with the same
 * key** occupy a single step; changing key opens a new one, so adjusting the accent and then
 * the borders stays two separately undoable things. The first record of each key always
 * pushes, so the state before the gesture stays reachable.
 */

/** Steps kept. Beyond this the oldest are dropped — memory does not grow without end. */
const MAX_DEPTH = 50

export interface History<T> {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
  /** The last gesture key; `null` when the next record has to push. */
  readonly coalesceKey: string | null
}

export function initHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], coalesceKey: null }
}

export function record<T>(history: History<T>, next: T, coalesceKey: string | null = null): History<T> {
  if (coalesceKey !== null && coalesceKey === history.coalesceKey) {
    // Replaces the top: this is still the same gesture.
    return { ...history, present: next, future: [] }
  }

  return {
    past: [...history.past, history.present].slice(-MAX_DEPTH),
    present: next,
    // Redo only makes sense while nobody has written over the abandoned branch.
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
