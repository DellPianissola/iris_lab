import { cascadeConfig } from '../config'

/**
 * Especificidade achatada em um número. Aproximação suficiente para decidir entre `.st0`,
 * `path` e `#logo` — os seletores que ferramenta de design gera. Não cobre `:where()`/
 * `:is()`, que elas não emitem.
 */
export function specificityOf(selector: string): number {
  let ids = 0
  let classes = 0
  let types = 0

  for (const compound of selector.split(/[\s>+~]+/).filter(Boolean)) {
    ids += countMatches(compound, /#[\w-]+/g)
    classes += countMatches(compound, /\.[\w-]+/g)
    classes += countMatches(compound, /\[[^\]]*\]/g)
    classes += countMatches(compound, /(?<!:):[\w-]+/g)
    if (/^[a-z][\w-]*/i.test(compound)) types += 1
  }

  return ids * cascadeConfig.idWeight + classes * cascadeConfig.classWeight + types
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length
}
