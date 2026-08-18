import { contrastRatio, hexToHsl, hslToHex, relativeLuminance } from '@nomai/color'
import { contrastSearch, darkBackgroundThreshold } from './config'

/**
 * Alvos do WCAG 2.x. São da especificação, não escolha nossa — por isso não estão em
 * `config.ts`.
 */
export const CONTRAST_TARGETS = {
  /** Texto normal, AA. */
  text: 4.5,
  /** Texto grande (≥18.66px negrito ou ≥24px), AA. */
  largeText: 3,
  /** Texto normal, AAA. */
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

/** Preto ou branco — o que contrastar mais com o fundo. */
export function readableOn(background: string): string {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#111111')
    ? '#ffffff'
    : '#111111'
}

/**
 * Empurra a cor até ela atingir o alvo de contraste contra o fundo em que vai aparecer.
 *
 * Existe porque **a cor da marca quase nunca serve como texto**: o verde `#16db65` dá
 * 1.85:1 contra branco. Sem esta função, marca neon vira texto ilegível. Em fundo claro a
 * cor escurece; em fundo escuro, clareia. Preserva matiz e saturação, mexe só na
 * luminosidade, para o resultado continuar reconhecível como a mesma cor.
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

  // Nem preto nem branco puro atingiram o alvo: o fundo é intermediário demais. Devolve o
  // extremo, que é o melhor possível, e deixa o painel de contraste denunciar.
  return towardsLight ? '#ffffff' : '#000000'
}
