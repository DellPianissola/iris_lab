/**
 * Costura entre o pipeline e o DOM. Parsear SVG exige um parser XML de verdade; o pipeline
 * recebe um por injeção em vez de importar, então o mesmo código roda no navegador hoje e
 * no servidor no dia em que arquivos passarem a ser gravados.
 */

export interface SvgDom {
  parse(text: string): Document
  serialize(node: Node): string
}

interface DomGlobals {
  DOMParser?: new () => DOMParser
  XMLSerializer?: new () => XMLSerializer
}

export function createDomFromGlobals(): SvgDom {
  const globals = globalThis as DomGlobals
  const Parser = globals.DOMParser
  const Serializer = globals.XMLSerializer
  if (!Parser || !Serializer) {
    throw new Error('DOMParser/XMLSerializer indisponíveis — passe um SvgDom explícito')
  }

  const parser = new Parser()
  const serializer = new Serializer()
  return {
    parse: (text) => parser.parseFromString(text, 'image/svg+xml'),
    serialize: (node) => serializer.serializeToString(node),
  }
}
