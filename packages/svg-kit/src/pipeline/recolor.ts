import { parseCssColor } from '@nomai/color'
import { recolorConfig } from '../config'
import { COLOR_PROPS, IMPLICIT_FILL, SVG_NAMESPACE, type ColorProp } from '../svg-spec'
import type { SvgAnalysis } from '../types'
import { findImplicitFillShapes } from './analyze'

/**
 * The injected sheet's `!important` beats a presentation attribute, an internal class and
 * inline style without important — which is why the swap is done by injection rather than
 * by rewriting the file. A regex over the markup would break in all three cases.
 */
export function buildThemedSvg(svg: SVGElement, analysis: SvgAnalysis): SVGElement {
  const themed = svg.cloneNode(true) as SVGElement
  const tones = analysis.palette.slice(0, recolorConfig.toneCount)

  tagDeclaredColors(themed, tones)
  tagImplicitFills(themed, toneOf(tones, IMPLICIT_FILL))
  injectToneStyle(themed)

  return themed
}

function tagDeclaredColors(svg: SVGElement, tones: readonly string[]): void {
  for (const el of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const prop of COLOR_PROPS) {
      const hex = parseCssColor(el.getAttribute(prop))
      if (hex) el.classList.add(toneClass(prop, toneOf(tones, hex)))
    }
  }
}

function tagImplicitFills(svg: SVGElement, tone: number): void {
  for (const el of findImplicitFillShapes(svg)) {
    el.classList.add(toneClass('fill', tone))
  }
}

/** A colour outside the dominant tones falls to the brand tone — recolouring is all or nothing. */
function toneOf(tones: readonly string[], hex: string): number {
  const index = tones.indexOf(hex)
  return index < 0 ? 0 : index
}

function toneClass(prop: ColorProp, tone: number): string {
  return `${recolorConfig.classPrefix}${prop[0]}${tone}`
}

/** The sheet is generated from config: changing the prefix or the tone count is enough. */
function toneStyleSheet(): string {
  const rules: string[] = []

  for (let tone = 0; tone < recolorConfig.toneCount; tone += 1) {
    for (const prop of COLOR_PROPS) {
      rules.push(`.${toneClass(prop, tone)}{${prop}:var(--tone-${tone},currentColor)!important}`)
    }
  }

  return rules.join('')
}

function injectToneStyle(svg: SVGElement): void {
  const style = svg.ownerDocument.createElementNS(SVG_NAMESPACE, 'style')
  style.textContent = toneStyleSheet()
  svg.insertBefore(style, svg.firstChild)
}
