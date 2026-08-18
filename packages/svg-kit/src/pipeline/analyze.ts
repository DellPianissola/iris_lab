import { parseCssColor } from '@nomai/color'
import { COLOR_PROPS, IMPLICIT_FILL, SHAPE_SELECTOR } from '../svg-spec'
import type { MarkKind, MarkWarning, SvgAnalysis } from '../types'

/**
 * Etapa 3 — conta as cores que o desenho realmente pinta e diz o que impede recolorir.
 * Roda depois de `normalizeSvg`, quando toda cor já vive em atributo.
 */
export function analyzeSvg(svg: SVGElement): SvgAnalysis {
  const counts = countDeclaredColors(svg)
  const implicitShapes = findImplicitFillShapes(svg)

  if (implicitShapes.length > 0) {
    counts[IMPLICIT_FILL] = (counts[IMPLICIT_FILL] ?? 0) + implicitShapes.length
  }

  const palette = Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))

  return {
    palette,
    counts,
    warnings: collectWarnings(svg),
    kind: classify(svg, palette),
    aspect: aspectOf(svg),
  }
}

function countDeclaredColors(svg: SVGElement): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const el of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const prop of COLOR_PROPS) {
      const hex = parseCssColor(el.getAttribute(prop))
      if (hex) counts[hex] = (counts[hex] ?? 0) + 1
    }
  }

  return counts
}

export function findImplicitFillShapes(svg: SVGElement): Element[] {
  return Array.from(svg.querySelectorAll(SHAPE_SELECTOR)).filter(
    (el) => !hasInheritedFill(el, svg),
  )
}

function hasInheritedFill(el: Element, svg: SVGElement): boolean {
  let node: Element | null = el

  while (node) {
    if (node.hasAttribute('fill')) return true
    if (node === svg) return false
    node = node.parentElement
  }

  return false
}

function collectWarnings(svg: SVGElement): MarkWarning[] {
  const warnings: MarkWarning[] = []

  if (svg.querySelector('image')) warnings.push({ code: 'embedded-raster' })
  if (svg.querySelector('linearGradient,radialGradient')) warnings.push({ code: 'gradient' })
  if (!svg.getAttribute('viewBox')) warnings.push({ code: 'missing-viewbox' })

  return warnings
}

function classify(svg: SVGElement, palette: readonly string[]): MarkKind {
  // Um `<image>` embutido é um PNG disfarçado de SVG: as cores dele não estão no markup,
  // então nenhuma contagem descreve o desenho.
  if (svg.querySelector('image')) return 'raster'
  if (palette.length <= 1) return 'mono'
  if (palette.length === 2) return 'duo'
  return 'multi'
}

function aspectOf(svg: SVGElement): number {
  const viewBox = svg.getAttribute('viewBox')
  if (!viewBox) return 1

  const numbers = viewBox.trim().split(/[\s,]+/).map(Number)
  const width = numbers[2]
  const height = numbers[3]

  if (numbers.length !== 4 || !width || !height || width <= 0 || height <= 0) return 1
  return width / height
}
