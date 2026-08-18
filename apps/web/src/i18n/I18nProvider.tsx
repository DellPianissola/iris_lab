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
    // O atributo `lang` governa hifenização, corretor ortográfico e leitor de tela; sem ele
    // o navegador continua tratando a página como português.
    document.documentElement.lang = locale

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Storage indisponível: a escolha vale só nesta sessão, o que é melhor que quebrar.
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
 * Exportada porque o `main.tsx` precisa do mesmo resultado **antes** da primeira pintura,
 * para ajustar o `lang` do documento. Duas implementações da mesma regra divergiriam.
 */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    const fromStorage = stored ? matchLocale([stored]) : null
    if (fromStorage) return fromStorage
  } catch {
    // Segue para a detecção pelo navegador.
  }

  return matchLocale(navigator.languages ?? [navigator.language]) ?? DEFAULT_LOCALE
}
