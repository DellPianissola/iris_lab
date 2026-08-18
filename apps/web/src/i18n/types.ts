export const LOCALES = ['pt-BR', 'en', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_STORAGE_KEY = 'iris.locale.v1'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Casa `pt-BR`, `pt` e `pt-PT` no mesmo idioma: o navegador manda a tag completa e nós só
 * temos uma variante de cada língua.
 */
export function matchLocale(tags: readonly string[]): Locale | null {
  for (const tag of tags) {
    if (isLocale(tag)) return tag

    const base = tag.split('-')[0]?.toLowerCase()
    const found = LOCALES.find((locale) => locale.split('-')[0] === base)
    if (found) return found
  }

  return null
}
