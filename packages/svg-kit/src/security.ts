/**
 * Política de sanitização. **Deliberadamente não fica em `config.ts`**: afrouxar qualquer
 * coisa aqui é decisão de segurança, e tem que custar abrir um arquivo chamado
 * `security.ts` e ler o porquê — não trocar um valor num arquivo de configuração.
 *
 * Isto protege quem envia o arquivo. Se o SVG passar a ser gravado e servido para outras
 * pessoas, ainda precisa de DOMPurify/SVGO **no servidor** antes da gravação.
 */

/** SVG é XML executável: aceita script, handlers e animação que dispara comportamento. */
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
 * Só referência interna e bitmap embutido sobrevivem em `href`.
 *
 * `data:image/svg+xml` fica **de fora** de propósito: um SVG aninhado carregaria script
 * junto, e a sanitização não desce nesse nível.
 */
export const SAFE_HREF = /^(#|data:image\/(png|jpeg|gif|webp);)/i

/** `@import` dentro do `<style>` interno buscaria CSS de fora do navegador do usuário. */
export const IMPORT_RULE = /@import[^;]*;?/gi

export const EVENT_HANDLER_PREFIX = 'on'

export const HREF_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'xlink:href'])
