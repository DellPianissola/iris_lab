import type { ThemeTokens } from '@nomai/theme'
import { useI18n } from '../../i18n'
import { contrastChecks, passingCount, worstGrade } from './checks'

interface ContrastBadgeProps {
  readonly tokens: ThemeTokens
}

/**
 * Contrast is a **meter**, not a control: it has to be readable while a colour is being
 * dragged, so the tally rides on the tab instead of waiting behind a click. The colour
 * reports the worst check, because an average would hide the one that fails.
 */
export function ContrastBadge({ tokens }: ContrastBadgeProps) {
  const { t } = useI18n()
  const checks = contrastChecks(tokens)

  return (
    <span className={`tag tag-${worstGrade(checks)}`}>
      {t.contrast.summary(passingCount(checks), checks.length)}
    </span>
  )
}
