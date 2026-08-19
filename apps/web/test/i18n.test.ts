import { describe, expect, it } from 'vitest'
import { createFormatters } from '../src/i18n/format'
import { en } from '../src/i18n/locales/en'
import { es } from '../src/i18n/locales/es'
import { IDENTICAL_IN_ENGLISH } from '../src/i18n/locales/identical-in-english'
import { ptBR } from '../src/i18n/locales/pt-BR'
import { LOCALES, matchLocale } from '../src/i18n/types'

const dictionaries = { 'pt-BR': ptBR, en, es }

/**
 * A missing key already fails `tsc`. These tests cover what the type cannot reach: a key that
 * is present but empty, and a forgotten translation.
 */

/** Every path in the dictionary, including those holding an interpolation function. */
function keyPaths(value: unknown, path = ''): string[] {
  if (typeof value !== 'object' || value === null) return path ? [path] : []

  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, path ? `${path}.${key}` : key),
  )
}

/** Only the paths holding text — a function cannot be compared. */
function stringEntries(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (typeof value !== 'object' || value === null) return []

  return Object.entries(value).flatMap(([key, child]) =>
    stringEntries(child, path ? `${path}.${key}` : key),
  )
}

describe('dictionaries', () => {
  it('covers the three declared languages', () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort())
  })

  // Seven keys hold an interpolation function. The first version of this file used a walker
  // that only collected strings, so those vanished from both sides and the comparison passed
  // without having seen them — a test promising coverage it did not have.
  it('counts function keys alongside text keys', () => {
    const paths = keyPaths(ptBR)

    expect(paths).toContain('app.shortcutHint')
    expect(paths).toContain('mockup.footer')
    expect(paths).toContain('symbol.failures.too-large')
    expect(paths.length).toBeGreaterThan(stringEntries(ptBR).length)
  })

  it.each(LOCALES)('%s has exactly the Portuguese keys', (locale) => {
    expect(keyPaths(dictionaries[locale])).toEqual(keyPaths(ptBR))
  })

  it.each(LOCALES)('%s has no empty string', (locale) => {
    const empty = stringEntries(dictionaries[locale])
      .filter(([, value]) => value.trim() === '')
      .map(([path]) => path)

    expect(empty).toEqual([])
  })

  /**
   * A key copied from Portuguese and never translated passes the compiler; it does not pass
   * here.
   *
   * English only. Portuguese and Spanish are close languages sharing dozens of exact cognates
   * — "Paleta", "Acento", "Símbolo", "Entrar", "Contraste" — so "identical to the Portuguese"
   * is no evidence of forgetting there, and the allowlist would outgrow the test itself.
   */
  it('English does not repeat the Portuguese', () => {
    const base = new Map(stringEntries(ptBR))
    const untranslated = stringEntries(en)
      .filter(([path, value]) => base.get(path) === value && !IDENTICAL_IN_ENGLISH.has(path))
      .map(([path]) => path)

    expect(untranslated).toEqual([])
  })

  it('holds no allowlist entry for a path that no longer exists', () => {
    const paths = new Set(keyPaths(ptBR))
    const stale = [...IDENTICAL_IN_ENGLISH].filter((path) => !paths.has(path))

    expect(stale).toEqual([])
  })
})

describe('formatters', () => {
  // The bug that motivated Intl: `toFixed` produced 4.58 even in Portuguese.
  it('uses the language decimal separator in the contrast ratio', () => {
    expect(createFormatters('pt-BR').ratio(4.58)).toBe('4,58')
    expect(createFormatters('en').ratio(4.58)).toBe('4.58')
    expect(createFormatters('es').ratio(4.58)).toBe('4,58')
  })

  it('groups thousands according to the language', () => {
    expect(createFormatters('pt-BR').integer(12480)).toBe('12.480')
    expect(createFormatters('en').integer(12480)).toBe('12,480')
  })

  it('takes a fraction and returns a percentage', () => {
    expect(createFormatters('pt-BR').percent(0.999)).toBe('99,9%')
    expect(createFormatters('en').percent(0.999)).toBe('99.9%')
  })

  it('formats the upload limit in megabytes', () => {
    expect(createFormatters('en').megabytes(4 * 1024 * 1024)).toMatch(/^4\s?MB$/)
  })
})

describe('matchLocale', () => {
  it('matches the exact tag', () => {
    expect(matchLocale(['es'])).toBe('es')
  })

  // The browser sends the full tag and we carry only one variant of each language.
  it('matches by language when the region does not', () => {
    expect(matchLocale(['pt-PT'])).toBe('pt-BR')
    expect(matchLocale(['en-GB'])).toBe('en')
    expect(matchLocale(['es-419'])).toBe('es')
  })

  it('respects the browser preference order', () => {
    expect(matchLocale(['de', 'es', 'en'])).toBe('es')
  })

  it('returns null when none match', () => {
    expect(matchLocale(['de', 'fr'])).toBeNull()
    expect(matchLocale([])).toBeNull()
  })
})
