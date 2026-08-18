/**
 * Chaves cujo inglês é legitimamente igual ao português — termo da especificação, nome
 * próprio, estrangeirismo já incorporado.
 *
 * Mora ao lado dos dicionários de propósito: quem acrescenta uma string está nesta pasta, e
 * a lista só é útil se for lembrada no mesmo gesto. Alimenta o teste que acusa tradução
 * esquecida.
 */
export const IDENTICAL_IN_ENGLISH: ReadonlySet<string> = new Set([
  'locale.names.pt-BR',
  'locale.names.en',
  'locale.names.es',
  'contrast.grades.aaa',
  'contrast.grades.aa',
  'presets.title',
  'app.cards.site',
  'mockup.accent',
  'mockup.stats.uptime',
  'mockup.nav.2',
  'mockup.nav.3',
  'typography.display',
  'presets.names.terracota',
])
