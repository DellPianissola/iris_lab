/**
 * Fatos ditados pela especificação do SVG. Não são configuração: ninguém "ajusta" o
 * namespace ou a cor padrão de `fill`. Ficam nomeados aqui para não aparecerem como
 * literal solto no meio do pipeline.
 */

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** Sem `fill` declarado em lugar nenhum acima, a spec manda pintar de preto. */
export const IMPLICIT_FILL = '#000000'

/** Elementos que pintam. `<g>` fica de fora: ele só repassa cor para os filhos. */
export const SHAPE_SELECTOR = 'path,rect,circle,ellipse,polygon,polyline,line,text,tspan,textPath'

/** Propriedades que carregam cor. Fill e stroke caem na mesma paleta de propósito: um
 *  contorno de outra cor é uma segunda cor da marca, não ruído. */
export const COLOR_PROPS = ['fill', 'stroke'] as const
export type ColorProp = (typeof COLOR_PROPS)[number]
