import { describe, expect, it } from 'vitest'
import { createFormatters } from '../src/i18n/format'
import { en } from '../src/i18n/locales/en'
import { es } from '../src/i18n/locales/es'
import { IDENTICAL_IN_ENGLISH } from '../src/i18n/locales/identical-in-english'
import { ptBR } from '../src/i18n/locales/pt-BR'
import { LOCALES, matchLocale } from '../src/i18n/types'

const dictionaries = { 'pt-BR': ptBR, en, es }

/**
 * Chave faltando já reprova no `tsc`. Estes testes cobrem o que o tipo não alcança: chave
 * presente mas vazia, e tradução esquecida.
 */

/** Todo caminho do dicionário, inclusive os que guardam função de interpolação. */
function keyPaths(value: unknown, path = ''): string[] {
  if (typeof value !== 'object' || value === null) return path ? [path] : []

  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, path ? `${path}.${key}` : key),
  )
}

/** Só os caminhos que guardam texto — função não tem como ser comparada. */
function stringEntries(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (typeof value !== 'object' || value === null) return []

  return Object.entries(value).flatMap(([key, child]) =>
    stringEntries(child, path ? `${path}.${key}` : key),
  )
}

describe('dicionários', () => {
  it('cobre os três idiomas declarados', () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort())
  })

  // Sete chaves guardam função de interpolação. A primeira versão deste arquivo usava um
  // caminhador que só coletava string, então essas sumiam dos dois lados e a comparação
  // passava sem tê-las visto — teste prometendo cobertura que não tinha.
  it('conta as chaves-função junto com as de texto', () => {
    const paths = keyPaths(ptBR)

    expect(paths).toContain('app.shortcutHint')
    expect(paths).toContain('mockup.footer')
    expect(paths).toContain('symbol.failures.too-large')
    expect(paths.length).toBeGreaterThan(stringEntries(ptBR).length)
  })

  it.each(LOCALES)('%s tem exatamente as chaves do português', (locale) => {
    expect(keyPaths(dictionaries[locale])).toEqual(keyPaths(ptBR))
  })

  it.each(LOCALES)('%s não tem string vazia', (locale) => {
    const empty = stringEntries(dictionaries[locale])
      .filter(([, value]) => value.trim() === '')
      .map(([path]) => path)

    expect(empty).toEqual([])
  })

  /**
   * Chave copiada do português e nunca traduzida passa pelo compilador; aqui não passa.
   *
   * Só vale para o inglês. Português e espanhol são línguas próximas e compartilham dezenas
   * de cognatas exatas — "Paleta", "Acento", "Símbolo", "Entrar", "Contraste" —, então
   * "igual ao português" ali não é sinal de esquecimento, e a allowlist necessária seria
   * maior que o próprio teste.
   */
  it('inglês não repete o português', () => {
    const base = new Map(stringEntries(ptBR))
    const untranslated = stringEntries(en)
      .filter(([path, value]) => base.get(path) === value && !IDENTICAL_IN_ENGLISH.has(path))
      .map(([path]) => path)

    expect(untranslated).toEqual([])
  })

  it('não guarda allowlist para caminho que não existe mais', () => {
    const paths = new Set(keyPaths(ptBR))
    const stale = [...IDENTICAL_IN_ENGLISH].filter((path) => !paths.has(path))

    expect(stale).toEqual([])
  })
})

describe('formatadores', () => {
  // O bug que motivou o Intl: `toFixed` produzia 4.58 mesmo em português.
  it('usa o separador decimal do idioma na razão de contraste', () => {
    expect(createFormatters('pt-BR').ratio(4.58)).toBe('4,58')
    expect(createFormatters('en').ratio(4.58)).toBe('4.58')
    expect(createFormatters('es').ratio(4.58)).toBe('4,58')
  })

  it('separa milhar conforme o idioma', () => {
    expect(createFormatters('pt-BR').integer(12480)).toBe('12.480')
    expect(createFormatters('en').integer(12480)).toBe('12,480')
  })

  it('recebe fração e devolve percentual', () => {
    expect(createFormatters('pt-BR').percent(0.999)).toBe('99,9%')
    expect(createFormatters('en').percent(0.999)).toBe('99.9%')
  })

  it('formata o limite de upload em megabytes', () => {
    expect(createFormatters('en').megabytes(4 * 1024 * 1024)).toMatch(/^4\s?MB$/)
  })
})

describe('matchLocale', () => {
  it('casa a tag exata', () => {
    expect(matchLocale(['es'])).toBe('es')
  })

  // O navegador manda a tag completa e só temos uma variante de cada língua.
  it('casa pela língua quando a região não bate', () => {
    expect(matchLocale(['pt-PT'])).toBe('pt-BR')
    expect(matchLocale(['en-GB'])).toBe('en')
    expect(matchLocale(['es-419'])).toBe('es')
  })

  it('respeita a ordem de preferência do navegador', () => {
    expect(matchLocale(['de', 'es', 'en'])).toBe('es')
  })

  it('devolve null quando nenhuma casa', () => {
    expect(matchLocale(['de', 'fr'])).toBeNull()
    expect(matchLocale([])).toBeNull()
  })
})
