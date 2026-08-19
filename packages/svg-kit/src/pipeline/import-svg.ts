import type { SvgDom } from '../adapters/dom'
import type { ImportedSvg, MarkKind, MarkMode } from '../types'
import { analyzeSvg } from './analyze'
import { normalizeSvg } from './normalize'
import { buildThemedSvg } from './recolor'
import { sanitizeSvg } from './sanitize'

/**
 * Returns `null` when the file is not a readable SVG. The interface never asks the user what
 * to do with the result: `mode` already arrives in the right position, and the switch on
 * screen exists only for them to disagree.
 */
export function importSvg(text: string, dom: SvgDom): ImportedSvg | null {
  const sanitized = sanitizeSvg(text, dom)
  if (!sanitized) return null

  const normalized = normalizeSvg(sanitized)
  const analysis = analyzeSvg(normalized)
  const themed = buildThemedSvg(normalized, analysis)

  return {
    type: 'svg',
    analysis,
    original: dom.serialize(normalized),
    themed: dom.serialize(themed),
    mode: defaultModeFor(analysis.kind),
  }
}

/**
 * One or two colours are an identity that survives the swap; three or more, and recolouring
 * breaks the brand.
 */
export function defaultModeFor(kind: MarkKind): MarkMode {
  return kind === 'mono' || kind === 'duo' ? 'theme' : 'original'
}
