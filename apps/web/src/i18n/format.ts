import type { Locale } from './types'

/**
 * `toFixed` sempre produz ponto decimal, então `4.58` aparecia igual em português, onde o
 * certo é `4,58`. Todo número exibido passa por `Intl`.
 *
 * Os formatadores são memoizados porque construir um `Intl.NumberFormat` é caro e estes
 * rodam a cada repintura do painel de contraste.
 */

const cache = new Map<string, Intl.NumberFormat>()

function formatter(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let found = cache.get(key)
  if (!found) {
    found = new Intl.NumberFormat(locale, options)
    cache.set(key, found)
  }
  return found
}

export interface Formatters {
  /** Razão de contraste, sempre com duas casas: `4,58` / `4.58`. */
  ratio(value: number): string
  integer(value: number): string
  /** Recebe a fração (0.999), não o número já multiplicado. */
  percent(value: number, fractionDigits?: number): string
  decimal(value: number, fractionDigits?: number): string
  megabytes(bytes: number): string
}

const BYTES_PER_MEGABYTE = 1024 * 1024

export function createFormatters(locale: Locale): Formatters {
  return {
    ratio: (value) =>
      formatter(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value),

    integer: (value) => formatter(locale, { maximumFractionDigits: 0 }).format(value),

    percent: (value, fractionDigits = 1) =>
      formatter(locale, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value),

    decimal: (value, fractionDigits = 1) =>
      formatter(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits,
      }).format(value),

    megabytes: (bytes) =>
      formatter(locale, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 0 }).format(
        bytes / BYTES_PER_MEGABYTE,
      ),
  }
}
