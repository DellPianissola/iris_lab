import type { Mark } from '../marks/types'

/**
 * Pure and isolated on purpose: the earlier version computed this by index inside the
 * `setMarks` updater, and an impure updater is invoked twice by StrictMode — the selection
 * moved two places instead of one.
 */
export function selectionAfterRemoval(
  marks: readonly Mark[],
  removedId: string,
  selectedId: string,
): string {
  if (removedId !== selectedId) return selectedId

  const index = marks.findIndex((mark) => mark.id === removedId)
  if (index < 0) return selectedId

  const neighbour = marks[index - 1] ?? marks[index + 1]
  return neighbour?.id ?? selectedId
}

/** The selected one, falling back to the first in the list if the id is gone. */
export function markById(marks: readonly Mark[], selectedId: string): Mark | undefined {
  return marks.find((mark) => mark.id === selectedId) ?? marks[0]
}
