import type { SvgDom } from '../adapters/dom'
import {
  DANGEROUS_ELEMENTS,
  EVENT_HANDLER_PREFIX,
  HREF_ATTRIBUTES,
  IMPORT_RULE,
  SAFE_HREF,
} from '../security'

/** Etapa 1 — arquivo enviado por usuário passa por aqui antes de encostar no documento. */
export function sanitizeSvg(text: string, dom: SvgDom): SVGElement | null {
  const doc = dom.parse(text)
  if (doc.querySelector('parsererror')) return null

  const svg = doc.querySelector('svg')
  if (!svg) return null

  svg.querySelectorAll(DANGEROUS_ELEMENTS).forEach((node) => node.remove())
  svg.querySelectorAll('style').forEach(stripImports)
  stripUnsafeAttributes(svg)
  svg.querySelectorAll('*').forEach(stripUnsafeAttributes)

  // Dimensão fixa no arquivo brigaria com o tamanho que o mockup pede; o viewBox basta.
  svg.removeAttribute('width')
  svg.removeAttribute('height')

  return svg as unknown as SVGElement
}

function stripImports(style: Element): void {
  const css = style.textContent ?? ''
  if (css.includes('@import')) style.textContent = css.replace(IMPORT_RULE, '')
}

function stripUnsafeAttributes(el: Element): void {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase()

    if (name.startsWith(EVENT_HANDLER_PREFIX)) {
      el.removeAttribute(attr.name)
      continue
    }

    if (HREF_ATTRIBUTES.has(name) && !SAFE_HREF.test(attr.value.trim())) {
      el.removeAttribute(attr.name)
    }
  }
}
