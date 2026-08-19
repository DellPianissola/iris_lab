import { cascadeConfig } from '../config'

/**
 * Specificity flattened into a single number. Close enough to decide between `.st0`, `path`
 * and `#logo` — the selectors design tools emit. Does not cover `:where()`/`:is()`, which
 * they do not emit.
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
