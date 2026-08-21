import { mix } from '@nomai/color'
import { chromeMix, gradeHues, gradeTint } from './config'
import { CONTRAST_TARGETS, isDark, legibleOn, readableOn } from './contrast'
import type { Palette } from './types'

/**
 * The tool's own surfaces, derived from the palette the customer is editing.
 *
 * The chrome used to be a fixed achromatic set, on the argument that a colour tool carrying a
 * hue competes with the palette on screen. Following the palette answers a stronger one: the
 * tool becomes its own demonstration — pick a palette and the product wearing it is right
 * there, which is exactly the question the customer came to answer.
 *
 * What makes it safe is that **nothing here uses the raw palette**. Every foreground goes
 * through the contrast search first, so a brand that fails as text in the mockup still reads
 * in the toolbar. A tool that audits contrast cannot become unreadable because someone chose
 * a bad palette — that is the one input it is guaranteed to receive.
 */
export interface ChromeTokens {
  readonly bg: string
  readonly panel: string
  /**
   * Lifted furthest from the background, which makes it the ground with the least room. Every
   * foreground below is corrected against this one: clearing the tightest clears the rest.
   */
  readonly panel2: string
  readonly line: string
  readonly hover: string
  readonly text: string
  readonly dim: string
  readonly faint: string
  readonly accent: string
  readonly onAccent: string
  readonly warn: string
  readonly danger: string
  /**
   * The three WCAG grade pills, each a foreground on its own tinted background. They are
   * derived rather than fixed because a pill drawn for a dark chrome is a dark blob on a light
   * one — the hue carries the meaning, the surface belongs to whatever it sits on.
   */
  readonly pass: string
  readonly passBg: string
  readonly large: string
  readonly largeBg: string
  readonly fail: string
  readonly failBg: string
  /**
   * The same three readings for the toolbar, where the ground is the brand rather than the
   * panel. They sit on `onAccent` — the one colour guaranteed to stand off the bar whatever
   * the brand is — because a chip tinted from the panel is a pale patch on a coloured bar, and
   * a solid one collides the moment the brand lands near a status hue: measured at 1.09:1
   * between a red-orange brand and the fail chip.
   */
  readonly passOnBar: string
  readonly largeOnBar: string
  readonly failOnBar: string
}

export function buildChrome(palette: Palette): ChromeTokens {
  const darkBackground = isDark(palette.bg)
  const tone = darkBackground ? 'dark' : 'light'
  const recipe = chromeMix[tone]

  // Every surface comes off `bg` rather than borrowing `surface`, so the distance between
  // them stays ours. Built on `surface` the gap between panel and field would depend on two
  // colours the customer edits for unrelated reasons, and could close to nothing.
  const away = darkBackground ? '#ffffff' : '#000000'
  const lift = (amount: number): string => mix(palette.bg, away, amount)

  const bg = lift(recipe.bg)
  const panel = lift(recipe.panel)
  const panel2 = lift(recipe.panel2)
  const accent = legibleOn(palette.brand, panel2, CONTRAST_TARGETS.largeText)

  const pill = (hue: string): readonly [string, string] => {
    const background = mix(panel, hue, gradeTint[tone])
    return [legibleOn(hue, background, CONTRAST_TARGETS.text), background]
  }

  const onAccent = legibleOn(readableOn(accent), accent, CONTRAST_TARGETS.text)
  const onBar = (hue: string): string => legibleOn(hue, onAccent, CONTRAST_TARGETS.text)

  const [pass, passBg] = pill(gradeHues.pass)
  const [large, largeBg] = pill(gradeHues.large)
  const [fail, failBg] = pill(gradeHues.fail)

  return {
    bg,
    panel,
    panel2,
    line: lift(recipe.line),
    hover: lift(recipe.hover),
    text: legibleOn(palette.text, panel2, CONTRAST_TARGETS.text),
    dim: legibleOn(palette.muted, panel2, CONTRAST_TARGETS.text),
    // Icon-only controls and disabled captions: 1.4.11 asks 3:1 of non-text, not 4.5.
    faint: legibleOn(palette.muted, panel2, CONTRAST_TARGETS.largeText),
    accent,
    onAccent,
    warn: legibleOn(gradeHues.large, panel2, CONTRAST_TARGETS.text),
    danger: legibleOn(gradeHues.fail, panel2, CONTRAST_TARGETS.text),
    pass,
    passBg,
    large,
    largeBg,
    fail,
    failBg,
    passOnBar: onBar(gradeHues.pass),
    largeOnBar: onBar(gradeHues.large),
    failOnBar: onBar(gradeHues.fail),
  }
}

/** Custom property names in one place, the same rule the theme tokens follow. */
const CSS_VAR_PREFIX = '--ui-'

const VAR_NAMES: Record<keyof ChromeTokens, string> = {
  bg: 'bg',
  panel: 'panel',
  panel2: 'panel-2',
  line: 'line',
  hover: 'hover',
  text: 'text',
  dim: 'dim',
  faint: 'faint',
  accent: 'accent',
  onAccent: 'on-accent',
  warn: 'warn',
  danger: 'danger',
  pass: 'pass',
  passBg: 'pass-bg',
  large: 'large',
  largeBg: 'large-bg',
  fail: 'fail',
  failBg: 'fail-bg',
  passOnBar: 'pass-on-bar',
  largeOnBar: 'large-on-bar',
  failOnBar: 'fail-on-bar',
}

export function chromeToCssVars(chrome: ChromeTokens): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [key, name] of Object.entries(VAR_NAMES)) {
    vars[`${CSS_VAR_PREFIX}${name}`] = chrome[key as keyof ChromeTokens]
  }

  return vars
}
