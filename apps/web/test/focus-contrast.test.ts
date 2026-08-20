import { contrastRatio } from '@nomai/color'
import { brandPalette, CONTRAST_TARGETS } from '@nomai/theme'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The tool chrome has a palette of its own, outside `@nomai/theme`, so nothing verified those
 * colours. A tool that audits contrast failing its own contrast is a credibility problem.
 *
 * The colours are **read from the CSS**, not transcribed: the first version of this file
 * copied the hex by hand and would have stayed green against the stale value the moment
 * anyone touched the sheet — a false guarantee, which is worse than no test.
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

/** A renamed variable in the CSS must not become a test that silently disappears. */
function color(name: string): string {
  const value = ui[name]
  if (!value) throw new Error(`--ui-${name} no longer exists in app.css`)
  return value
}

/** WCAG 1.4.11: focus indicators and component boundaries need 3:1 against the neighbour. */
const NON_TEXT_TARGET = CONTRAST_TARGETS.largeText

describe('contrast of the tool chrome', () => {
  it('reads the palette from the stylesheet', () => {
    expect(Object.keys(ui).length).toBeGreaterThanOrEqual(8)
    expect(color('accent')).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it.each([
    ['focus ring on the background', 'accent', 'bg'],
    ['focus ring on the panel', 'accent', 'panel'],
    ['focus ring on the field', 'accent', 'panel-2'],
  ])('%s reaches 3:1', (_name, a, b) => {
    expect(contrastRatio(color(a), color(b))).toBeGreaterThanOrEqual(NON_TEXT_TARGET)
  })

  /**
   * The stylesheet cannot import TypeScript, so the accent is written out by hand — which
   * means nothing would notice the day the brand green changes in `brand.json` and the chrome
   * keeps the old one. This is the thread between the two files.
   */
  it('uses the brand green as the chrome accent', () => {
    expect(color('accent')).toBe(brandPalette('light').brand)
  })

  it.each([
    ['text on the panel', 'text', 'panel'],
    ['muted text on the panel', 'dim', 'panel'],
    ['muted text on the field', 'dim', 'panel-2'],
    ['warning on the field', 'warn', 'panel-2'],
    ['error on the panel', 'danger', 'panel'],
    ['pass pill', 'pass', 'pass-bg'],
    ['large-only pill', 'warn', 'warn-bg'],
    ['fail pill', 'danger', 'danger-bg'],
  ])('%s reaches 4.5:1', (_name, a, b) => {
    expect(contrastRatio(color(a), color(b))).toBeGreaterThanOrEqual(CONTRAST_TARGETS.text)
  })

  it('primary button text is legible on the accent', () => {
    expect(contrastRatio(color('on-accent'), color('accent'))).toBeGreaterThanOrEqual(
      CONTRAST_TARGETS.text,
    )
  })
})
