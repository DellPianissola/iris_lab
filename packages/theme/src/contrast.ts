import { contrastRatio, hexToHsl, hslToHex, relativeLuminance } from '@nomai/color'
import { contrastSearch, darkBackgroundThreshold } from './config'

/**
 * WCAG 2.x targets. They come from the specification, not from us — which is why they are
 * not in `config.ts`.
 */
export const CONTRAST_TARGETS = {
  /** Normal text, AA. */
  text: 4.5,
  /** Large text (≥18.66px bold or ≥24px), AA. */
  largeText: 3,
  /** Normal text, AAA. */
  enhanced: 7,
} as const

export type ContrastGrade = 'fail' | 'large' | 'aa' | 'aaa'

export function gradeOf(ratio: number): ContrastGrade {
  if (ratio >= CONTRAST_TARGETS.enhanced) return 'aaa'
  if (ratio >= CONTRAST_TARGETS.text) return 'aa'
  if (ratio >= CONTRAST_TARGETS.largeText) return 'large'
  return 'fail'
}

export function isDark(hex: string): boolean {
  return relativeLuminance(hex) < darkBackgroundThreshold
}

/** Black or white — whichever contrasts more with the background. */
export function readableOn(background: string): string {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#111111')
    ? '#ffffff'
    : '#111111'
}

/**
 * The contrast search, with a floor under it.
 *
 * `ensureContrast` gives up on a mid-toned background and returns the extreme, which may still
 * miss the target. Everything the tool paints its own surfaces with goes through here instead,
 * because the guarantee has to hold for **any** palette the customer types — including the
 * unreadable ones the product exists to catch.
 *
 * The fallback is pure black or pure white, not the near-black `readableOn` prefers: the
 * softer tone is the nicer default but it peaks at 4.49:1 on the worst background, and 4.49
 * is a failure. Pure extremes bottom out at 4.58:1 against **any** colour, so the floor holds.
 */
export function legibleOn(color: string, background: string, target: number): string {
  const pushed = ensureContrast(color, background, target)
  if (contrastRatio(pushed, background) >= target) return pushed

  const softer = readableOn(background)
  if (contrastRatio(softer, background) >= target) return softer

  return contrastRatio(background, '#000000') >= contrastRatio(background, '#ffffff')
    ? '#000000'
    : '#ffffff'
}

/**
 * Pushes the colour until it meets the contrast target against the background it will appear
 * on.
 *
 * It exists because **a brand colour almost never works as text**: the green `#16db65` gives
 * 1.85:1 against white. Without this, neon brand becomes unreadable copy. On light grounds
 * the colour darkens; on dark ones it lightens. Hue and saturation are preserved and only
 * lightness moves, so the result still reads as the same colour.
 */
export function ensureContrast(
  color: string,
  background: string,
  target: number = CONTRAST_TARGETS.text,
): string {
  if (contrastRatio(color, background) >= target) return color

  const [hue, saturation, lightness] = hexToHsl(color)
  const towardsLight = isDark(background)
  const step = towardsLight ? contrastSearch.lightnessStep : -contrastSearch.lightnessStep

  let candidateLightness = lightness

  for (let taken = 0; taken < contrastSearch.maxSteps; taken += 1) {
    candidateLightness += step
    if (candidateLightness <= 0 || candidateLightness >= 1) break

    const candidate = hslToHex(hue, saturation, candidateLightness)
    if (contrastRatio(candidate, background) >= target) return candidate
  }

  // Neither pure black nor pure white reached the target: the background is too mid-toned.
  // Return the extreme, which is the best available, and let the contrast panel call it out.
  return towardsLight ? '#ffffff' : '#000000'
}
