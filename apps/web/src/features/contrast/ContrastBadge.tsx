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
 *
 * The visible form is `5/6` and the spoken one is the whole sentence. Written out, the badge
 * made its tab almost three times the width of the others, and the row of tabs is supposed to
 * read as one row of equal buttons.
 */
export function ContrastBadge({ tokens }: ContrastBadgeProps) {
  const { t } = useI18n()
  const checks = contrastChecks(tokens)
  const passing = passingCount(checks)

  return (
    <span className={`tag tag-${worstGrade(checks)}`}>
      <span aria-hidden="true">{t.contrast.summaryShort(passing, checks.length)}</span>
      <span className="sr-only">{t.contrast.summary(passing, checks.length)}</span>
    </span>
  )
}
