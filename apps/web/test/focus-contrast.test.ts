import { contrastRatio } from '@nomai/color'
import { CONTRAST_TARGETS } from '@nomai/theme'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * O chrome da ferramenta tem paleta própria, fora do `@nomai/theme`, então nada verificava
 * essas cores. Uma ferramenta que audita contraste falhando no próprio contraste é problema
 * de credibilidade.
 *
 * As cores são **lidas do CSS**, não transcritas: a primeira versão deste arquivo copiava os
 * hex à mão e teria continuado verde contra o valor antigo no dia em que alguém mexesse na
 * folha — garantia falsa, que é pior do que teste nenhum.
 */

const CSS_PATH = join(dirname(fileURLToPath(import.meta.url)), '../src/styles/app.css')

function readUiPalette(): Record<string, string> {
  const css = readFileSync(CSS_PATH, 'utf8')
  const palette: Record<string, string> = {}

  for (const [, name, value] of css.matchAll(/--ui-([\w-]+)\s*:\s*(#[0-9a-f]{3,8})\s*;/gi)) {
    if (name && value) palette[name] = value
  }

  return palette
}

const ui = readUiPalette()

/** Nome trocado no CSS não pode virar teste que some em silêncio. */
function color(name: string): string {
  const value = ui[name]
  if (!value) throw new Error(`--ui-${name} não existe mais em app.css`)
  return value
}

/** WCAG 1.4.11: indicador de foco e limite de componente pedem 3:1 contra o vizinho. */
const NON_TEXT_TARGET = CONTRAST_TARGETS.largeText

describe('contraste do chrome da ferramenta', () => {
  it('lê a paleta da folha de estilo', () => {
    expect(Object.keys(ui).length).toBeGreaterThanOrEqual(8)
    expect(color('accent')).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it.each([
    ['anel de foco sobre o fundo', 'accent', 'bg'],
    ['anel de foco sobre o painel', 'accent', 'panel'],
    ['anel de foco sobre o campo', 'accent', 'panel-2'],
  ])('%s atinge 3:1', (_name, a, b) => {
    expect(contrastRatio(color(a), color(b))).toBeGreaterThanOrEqual(NON_TEXT_TARGET)
  })

  it.each([
    ['texto sobre o painel', 'text', 'panel'],
    ['texto suave sobre o painel', 'dim', 'panel'],
    ['texto suave sobre o campo', 'dim', 'panel-2'],
    ['aviso sobre o campo', 'warn', 'panel-2'],
    ['erro sobre o painel', 'danger', 'panel'],
  ])('%s atinge 4.5:1', (_name, a, b) => {
    expect(contrastRatio(color(a), color(b))).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('texto do botão primário é legível sobre o acento', () => {
    expect(contrastRatio(color('on-accent'), color('accent'))).toBeGreaterThanOrEqual(
      CONTRAST_TARGETS.text,
    )
  })
})
