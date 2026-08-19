/**
 * The seam between the pipeline and the DOM. Parsing SVG needs a real XML parser; the
 * pipeline takes one by injection rather than importing it, so the same code runs in the
 * browser today and on a server the day files start being stored.
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
    throw new Error('DOMParser/XMLSerializer unavailable — pass an explicit SvgDom')
  }

  const parser = new Parser()
  const serializer = new Serializer()
  return {
    parse: (text) => parser.parseFromString(text, 'image/svg+xml'),
    serialize: (node) => serializer.serializeToString(node),
  }
}
