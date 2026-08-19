import type { Locale } from './types'

/**
 * `toFixed` always emits a dot, so `4.58` showed up the same in Portuguese, where it should
 * be `4,58`. Every displayed number goes through `Intl`.
 *
 * The formatters are memoised because constructing an `Intl.NumberFormat` is expensive and
 * these run on every repaint of the contrast panel.
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
  /** Contrast ratio, always two decimals: `4,58` / `4.58`. */
  ratio(value: number): string
  integer(value: number): string
  /** Takes the fraction (0.999), not the already-multiplied number. */
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
