import { COLOR_PROPS, type ColorProp } from '../svg-spec'
import { specificityOf } from './specificity'

/**
 * Extrator mínimo de CSS: o que interessa é `fill`/`stroke` dentro de `<style>` interno.
 *
 * O protótipo usava `/([^{}]+)\{([^{}]*)\}/g`, que quebra em qualquer bloco aninhado
 * (`@media`, `@supports`). Aqui o texto é percorrido contando chaves, então bloco aninhado
 * não desalinha o resto do arquivo.
 */

export interface ColorDeclaration {
  readonly prop: ColorProp
  readonly value: string
  readonly important: boolean
}

export interface ColorRule {
  readonly selector: string
  readonly specificity: number
  /** Posição no documento — desempata regras de mesma especificidade (vence a última). */
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

    // Tudo antes do último `;` é at-rule sem bloco (`@import url(...);`) já encerrada —
    // o seletor de verdade é só o que sobra depois dela.
    const raw = css.slice(cursor, open)
    const lastSemicolon = raw.lastIndexOf(';')
    const prelude = (lastSemicolon >= 0 ? raw.slice(lastSemicolon + 1) : raw).trim()

    // At-rule com bloco (`@media`, `@supports`) é pulada inteira: aplicar as declarações
    // dela incondicionalmente pintaria o desenho com uma regra de print ou de outro
    // breakpoint que talvez nunca valha na tela.
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
