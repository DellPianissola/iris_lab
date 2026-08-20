import type { ThemeTokens } from '@nomai/theme'
import { useI18n } from '../../i18n'
import { contrastChecks } from './checks'

interface ContrastPanelProps {
  readonly tokens: ThemeTokens
}

export function ContrastPanel({ tokens }: ContrastPanelProps) {
  const { t, format } = useI18n()

  return (
    <div className="contrast">
      {contrastChecks(tokens).map((check) => (
        <div key={check.key} className="contrast-row">
          <span className="contrast-name">{t.contrast.checks[check.key]}</span>
          <b>{format.ratio(check.ratio)}</b>
          <span className={`tag tag-${check.grade}`}>{t.contrast.grades[check.grade]}</span>
        </div>
      ))}
    </div>
  )
}
