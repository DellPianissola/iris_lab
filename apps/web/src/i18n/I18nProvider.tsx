import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createFormatters, type Formatters } from './format'
import { en } from './locales/en'
import { es } from './locales/es'
import { ptBR, type Dictionary } from './locales/pt-BR'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, matchLocale, type Locale } from './types'

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = {
  'pt-BR': ptBR,
  en,
  es,
}

interface I18nValue {
  readonly locale: Locale
  readonly t: Dictionary
  readonly format: Formatters
  readonly setLocale: (next: Locale) => void
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale)

  useEffect(() => {
    // The `lang` attribute governs hyphenation, spellcheck and screen readers; without it
    // the browser keeps treating the page as Portuguese.
    document.documentElement.lang = locale

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Storage unavailable: the choice lasts this session only, which beats breaking.
    }
  }, [locale])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: DICTIONARIES[locale],
      format: createFormatters(locale),
      setLocale,
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n precisa estar dentro de <I18nProvider>')
  return value
}

/**
 * Exported because `main.tsx` needs the same answer **before** the first paint, to set the
 * document lang. Two implementations of one rule would drift apart.
 */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    const fromStorage = stored ? matchLocale([stored]) : null
    if (fromStorage) return fromStorage
  } catch {
    // Falls through to browser detection.
  }

  return matchLocale(navigator.languages ?? [navigator.language]) ?? DEFAULT_LOCALE
}
