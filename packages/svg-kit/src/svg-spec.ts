/**
 * Facts dictated by the SVG specification. Not configuration: nobody "tunes" the namespace
 * or the default `fill`. Named here so they do not appear as loose literals mid-pipeline.
 */

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** With no `fill` declared anywhere above it, the spec says paint it black. */
export const IMPLICIT_FILL = '#000000'

/** Elements that paint. `<g>` is left out: it only passes colour down to its children. */
export const SHAPE_SELECTOR = 'path,rect,circle,ellipse,polygon,polyline,line,text,tspan,textPath'

/** Properties that carry colour. Fill and stroke land in the same palette on purpose: an
 *  outline in another colour is a second brand colour, not noise. */
export const COLOR_PROPS = ['fill', 'stroke'] as const
export type ColorProp = (typeof COLOR_PROPS)[number]
