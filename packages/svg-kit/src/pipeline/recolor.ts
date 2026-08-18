import { parseCssColor } from '@nomai/color'
import { recolorConfig } from '../config'
import { COLOR_PROPS, IMPLICIT_FILL, SVG_NAMESPACE, type ColorProp } from '../svg-spec'
import type { SvgAnalysis } from '../types'
import { findImplicitFillShapes } from './analyze'

/**
 * Etapa 4 — marca cada elemento com a classe do seu tom e injeta a regra dentro do próprio
 * SVG.
 *
 * O `!important` da folha injetada vence atributo de apresentação, classe interna e style
 * inline sem important — que é o motivo de a troca ser feita por injeção e não reescrevendo
 * o arquivo. Regex sobre o markup quebraria nos três casos.
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

/** Cor fora dos tons dominantes cai no tom da marca — recolorir é tudo ou nada. */
function toneOf(tones: readonly string[], hex: string): number {
  const index = tones.indexOf(hex)
  return index < 0 ? 0 : index
}

function toneClass(prop: ColorProp, tone: number): string {
  return `${recolorConfig.classPrefix}${prop[0]}${tone}`
}

/** A folha é gerada a partir da config: mudar o prefixo ou a quantidade de tons basta. */
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
