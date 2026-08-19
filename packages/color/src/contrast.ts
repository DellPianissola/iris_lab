import { hexToRgb } from './convert'

/**
 * WCAG 2.x contrast. These are formulas from the specification, not choices of ours — which
 * is why the numbers live here as constants rather than in a config file.
 */

const LUMINANCE_WEIGHTS = { r: 0.2126, g: 0.7152, b: 0.0722 } as const
const GAMMA_THRESHOLD = 0.03928
const GAMMA_DIVISOR = 12.92
const GAMMA_OFFSET = 0.055
const GAMMA_EXPONENT = 2.4

const FLARE = 0.05

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(linearize) as [number, number, number]
  return LUMINANCE_WEIGHTS.r * r + LUMINANCE_WEIGHTS.g * g + LUMINANCE_WEIGHTS.b * b
}

function linearize(channel: number): number {
  const value = channel / 255
  return value <= GAMMA_THRESHOLD
    ? value / GAMMA_DIVISOR
    : Math.pow((value + GAMMA_OFFSET) / (1 + GAMMA_OFFSET), GAMMA_EXPONENT)
}

/** Symmetric: argument order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + FLARE) / (darker + FLARE)
}
