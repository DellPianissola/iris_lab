import { contrastRatio } from '@nomai/color'
import { gradeOf, type ContrastGrade, type ThemeTokens } from '@nomai/theme'

/**
 * The code owns the ids and the dictionary must cover them, the same direction the preset and
 * font ids run: `contrast.checks` carries a `satisfies Record<CheckKey, string>`, so a check
 * added here without a translation does not compile, and a translation for a check that no
 * longer exists does not either.
 */
export type CheckKey =
  | 'textOnBg'
  | 'mutedOnBg'
  | 'brandOnBg'
  | 'onBrand'
  | 'accentOnBg'
  | 'inkOnSoft'

export interface ContrastCheck {
  readonly key: CheckKey
  readonly ratio: number
  readonly grade: ContrastGrade
}

/** Shared by the drawer and by the reading on the toolbar tab, which must not disagree. */
export function contrastChecks(tokens: ThemeTokens): readonly ContrastCheck[] {
  const pairs: readonly (readonly [CheckKey, string, string])[] = [
    ['textOnBg', tokens.text, tokens.bg],
    ['mutedOnBg', tokens.muted, tokens.bg],
    ['brandOnBg', tokens.brand, tokens.bg],
    ['onBrand', tokens.onBrand, tokens.brand],
    ['accentOnBg', tokens.accent, tokens.bg],
    ['inkOnSoft', tokens.brandInk, tokens.brandSoft],
  ]

  return pairs.map(([key, a, b]) => {
    const ratio = contrastRatio(a, b)
    return { key, ratio, grade: gradeOf(ratio) }
  })
}

/**
 * `large` deliberately does not count. It clears 3:1, which only passes for text at 18pt or
 * bolded 14pt, and these colours paint body-size text in the mockup — a meter whose reason to
 * exist is catching the optimistic reading must not round in its own favour.
 */
export function passingCount(checks: readonly ContrastCheck[]): number {
  return checks.filter((check) => check.grade === 'aa' || check.grade === 'aaa').length
}

/** The reading is only useful if it reports the worst case, not the average. */
export function worstGrade(checks: readonly ContrastCheck[]): ContrastGrade {
  const order: readonly ContrastGrade[] = ['fail', 'large', 'aa', 'aaa']
  return checks.reduce<ContrastGrade>(
    (worst, check) => (order.indexOf(check.grade) < order.indexOf(worst) ? check.grade : worst),
    'aaa',
  )
}
