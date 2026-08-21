/**
 * Keys whose English is legitimately identical to the Portuguese — a specification term, a
 * proper noun, a loanword already absorbed.
 *
 * It lives beside the dictionaries on purpose: whoever adds a string is already in this
 * folder, and the list is only useful if it is remembered in the same gesture. Feeds the
 * test that catches a forgotten translation.
 */
export const IDENTICAL_IN_ENGLISH: ReadonlySet<string> = new Set([
  'locale.names.pt-BR',
  'locale.names.en',
  'locale.names.es',
  'contrast.grades.aaa',
  'contrast.grades.aa',
  'presets.title',
  'app.company',
  'mockup.accent',
  'mockup.stats.uptime',
  'mockup.nav.2',
  'mockup.nav.3',
  'typography.display',
  'presets.names.terracota',
])
