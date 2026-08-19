import { COLOR_PROPS, type ColorProp } from '../svg-spec'
import { specificityOf } from './specificity'

/**
 * The prototype used `/([^{}]+)\{([^{}]*)\}/g`, which breaks on any nested block (`@media`,
 * `@supports`). Here the text is walked counting braces, so a nested block does not throw
 * off the rest of the file.
 */

export interface ColorDeclaration {
  readonly prop: ColorProp
  readonly value: string
  readonly important: boolean
}

export interface ColorRule {
  readonly selector: string
  readonly specificity: number
  /** Document position — breaks ties between rules of equal specificity (the last one wins). */
  readonly order: number
  readonly declarations: readonly ColorDeclaration[]
}

export function extractColorRules(css: string, startOrder = 0): ColorRule[] {
  const rules: ColorRule[] = []
  let order = startOrder

  for (const block of iterateStyleBlocks(stripComments(css))) {
    const declarations = parseColorDeclarations(block.body)
    if (declarations.length === 0) continue

    for (const selector of splitSelectorList(block.prelude)) {
      rules.push({ selector, specificity: specificityOf(selector), order, declarations })
      order += 1
    }
  }

  return rules
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

interface StyleBlock {
  readonly prelude: string
  readonly body: string
}

function* iterateStyleBlocks(css: string): Generator<StyleBlock> {
  let cursor = 0

  while (cursor < css.length) {
    const open = css.indexOf('{', cursor)
    if (open < 0) return

    const close = findMatchingBrace(css, open)
    if (close < 0) return

    // Everything before the last `;` is a block-less at-rule (`@import url(...);`) already
    // closed — the real selector is only what remains after it.
    const raw = css.slice(cursor, open)
    const lastSemicolon = raw.lastIndexOf(';')
    const prelude = (lastSemicolon >= 0 ? raw.slice(lastSemicolon + 1) : raw).trim()

    // A block at-rule (`@media`, `@supports`) is skipped whole: applying its declarations
    // unconditionally would paint the drawing with a print rule, or another breakpoint's,
    // that may never apply on screen.
    if (prelude && !prelude.startsWith('@')) {
      yield { prelude, body: css.slice(open + 1, close) }
    }

    cursor = close + 1
  }
}

function findMatchingBrace(css: string, open: number): number {
  let depth = 0
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function splitSelectorList(prelude: string): string[] {
  return prelude.split(',').map((selector) => selector.trim()).filter(Boolean)
}

function parseColorDeclarations(body: string): ColorDeclaration[] {
  const declarations: ColorDeclaration[] = []

  for (const chunk of body.split(';')) {
    const colon = chunk.indexOf(':')
    if (colon < 0) continue

    const prop = chunk.slice(0, colon).trim().toLowerCase()
    if (!isColorProp(prop)) continue

    let value = chunk.slice(colon + 1).trim()
    const important = /!\s*important$/i.test(value)
    if (important) value = value.replace(/!\s*important$/i, '').trim()
    if (value) declarations.push({ prop, value, important })
  }

  return declarations
}

function isColorProp(prop: string): prop is ColorProp {
  return (COLOR_PROPS as readonly string[]).includes(prop)
}
