/**
 * Sanitisation policy. **Deliberately not in `config.ts`**: loosening anything here is a
 * security decision, and it should cost opening a file called `security.ts` and reading the
 * reason — not changing a value in a configuration file.
 *
 * This protects whoever uploads the file. If the SVG ever gets stored and served to other
 * people, it still needs DOMPurify/SVGO **on the server** before it is written.
 */

/** SVG is executable XML: it accepts script, handlers and animation that triggers behaviour. */
export const DANGEROUS_ELEMENTS = [
  'script',
  'foreignObject',
  'animate',
  'animateTransform',
  'animateMotion',
  'set',
  'handler',
].join(',')

/**
 * Only internal references and embedded bitmaps survive in `href`.
 *
 * `data:image/svg+xml` is left **out** on purpose: a nested SVG would carry script along,
 * and sanitisation does not descend to that level.
 */
export const SAFE_HREF = /^(#|data:image\/(png|jpeg|gif|webp);)/i

/** `@import` inside the internal `<style>` would fetch CSS from outside the user's browser. */
export const IMPORT_RULE = /@import[^;]*;?/gi

export const EVENT_HANDLER_PREFIX = 'on'

export const HREF_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'xlink:href'])
