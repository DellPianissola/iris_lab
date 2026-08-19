import { extractColorRules, type ColorRule } from '../css/rules'
import { COLOR_PROPS, type ColorProp } from '../svg-spec'

/**
 * Collapses every colour into a presentation attribute, whether it came from an internal
 * `<style>` or from inline `style`. After this there is one place to look for colour,
 * whichever tool exported the file.
 *
 * The order follows the real cascade, which is where the prototype was wrong twice:
 *
 *   1. inline `!important`   (strongest)
 *   2. stylesheet `!important`
 *   3. inline normal
 *   4. stylesheet normal
 *   5. presentation attribute  (weakest — specificity zero)
 *
 * The prototype only wrote the attribute when it was absent, so (a) the attribute beat the
 * stylesheet, the reverse of what browsers do, and (b) among rules of equal specificity the
 * first won, where CSS takes the last. Illustrator emits `class="st0" fill="#000"` often
 * enough that (a) is not hypothetical.
 */

/** A declaration's strength; the highest wins. */
const Rank = {
  StylesheetNormal: 1,
  InlineNormal: 2,
  StylesheetImportant: 3,
  InlineImportant: 4,
} as const
type Rank = (typeof Rank)[keyof typeof Rank]

interface Candidate {
  readonly value: string
  readonly rank: Rank
  readonly specificity: number
  readonly order: number
}

type Winners = Map<Element, Map<ColorProp, Candidate>>

export function normalizeSvg(svg: SVGElement): SVGElement {
  const rules = collectRules(svg)
  const winners: Winners = new Map()

  applyStylesheetRules(svg, rules, winners)
  applyInlineStyles(svg, winners)
  writeAttributes(winners)

  svg.querySelectorAll('style').forEach((style) => style.remove())
  return svg
}

function collectRules(svg: SVGElement): ColorRule[] {
  const rules: ColorRule[] = []
  svg.querySelectorAll('style').forEach((style) => {
    rules.push(...extractColorRules(style.textContent ?? '', rules.length))
  })
  return rules
}

function applyStylesheetRules(svg: SVGElement, rules: ColorRule[], winners: Winners): void {
  for (const rule of rules) {
    for (const el of matchAll(svg, rule.selector)) {
      for (const declaration of rule.declarations) {
        offer(winners, el, declaration.prop, {
          value: declaration.value,
          rank: declaration.important ? Rank.StylesheetImportant : Rank.StylesheetNormal,
          specificity: rule.specificity,
          order: rule.order,
        })
      }
    }
  }
}

function applyInlineStyles(svg: SVGElement, winners: Winners): void {
  const withStyle = [svg, ...Array.from(svg.querySelectorAll('[style]'))]

  for (const el of withStyle) {
    const style = (el as HTMLElement).style
    if (!style) continue

    for (const prop of COLOR_PROPS) {
      const value = style.getPropertyValue(prop)
      if (!value) continue

      const important = style.getPropertyPriority(prop) === 'important'
      offer(winners, el, prop, {
        value: value.trim(),
        rank: important ? Rank.InlineImportant : Rank.InlineNormal,
        specificity: 0,
        order: 0,
      })
      style.removeProperty(prop)
    }

    if (el.getAttribute('style') === '') el.removeAttribute('style')
  }
}

function offer(winners: Winners, el: Element, prop: ColorProp, candidate: Candidate): void {
  let forElement = winners.get(el)
  if (!forElement) {
    forElement = new Map()
    winners.set(el, forElement)
  }

  const current = forElement.get(prop)
  if (!current || beats(candidate, current)) forElement.set(prop, candidate)
}

function beats(candidate: Candidate, current: Candidate): boolean {
  if (candidate.rank !== current.rank) return candidate.rank > current.rank
  if (candidate.specificity !== current.specificity) {
    return candidate.specificity > current.specificity
  }
  return candidate.order >= current.order
}

function writeAttributes(winners: Winners): void {
  for (const [el, byProp] of winners) {
    for (const [prop, candidate] of byProp) {
      el.setAttribute(prop, candidate.value)
    }
  }
}

function matchAll(svg: SVGElement, selector: string): Element[] {
  try {
    const matches = Array.from(svg.querySelectorAll(selector))
    if (svg.matches(selector)) matches.unshift(svg)
    return matches
  } catch {
    // A selector the browser rejects paints nothing in the browser either.
    return []
  }
}
