import type { SvgDom } from '../adapters/dom'
import type { ImportedSvg, MarkKind, MarkMode } from '../types'
import { analyzeSvg } from './analyze'
import { normalizeSvg } from './normalize'
import { buildThemedSvg } from './recolor'
import { sanitizeSvg } from './sanitize'

/**
 * Devolve `null` quando o arquivo não é um SVG legível. A interface nunca pergunta ao
 * usuário o que fazer com o resultado: `mode` já vem na posição certa, e o interruptor na
 * tela existe só para ele discordar.
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
 * Uma ou duas cores são identidade que sobrevive à troca; três ou mais, e recolorir
 * descaracteriza a marca.
 */
export function defaultModeFor(kind: MarkKind): MarkMode {
  return kind === 'mono' || kind === 'duo' ? 'theme' : 'original'
}
