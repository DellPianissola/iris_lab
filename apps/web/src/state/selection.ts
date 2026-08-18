import type { Mark } from '../marks/types'

/**
 * Qual símbolo fica selecionado depois de remover um. Função pura e isolada de propósito:
 * a versão anterior calculava isto por índice dentro do updater de `setMarks`, e updater
 * impuro é invocado duas vezes pelo StrictMode — a seleção andava duas casas em vez de uma.
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

/** O selecionado, com queda para o primeiro da lista se o id não existir mais. */
export function markById(marks: readonly Mark[], selectedId: string): Mark | undefined {
  return marks.find((mark) => mark.id === selectedId) ?? marks[0]
}
