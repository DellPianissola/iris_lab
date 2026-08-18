import { contrastRatio } from '@nomai/color'
import { gradeOf, type ThemeTokens } from '@nomai/theme'
import { Group } from '../../components/Field'
import { useI18n } from '../../i18n'

interface ContrastPanelProps {
  readonly tokens: ThemeTokens
}

export function ContrastPanel({ tokens }: ContrastPanelProps) {
  const { t, format } = useI18n()
  const labels = t.contrast.checks

  const checks = [
    { key: 'textOnBg', label: labels.textOnBg, ratio: contrastRatio(tokens.text, tokens.bg) },
    { key: 'mutedOnBg', label: labels.mutedOnBg, ratio: contrastRatio(tokens.muted, tokens.bg) },
    { key: 'brandOnBg', label: labels.brandOnBg, ratio: contrastRatio(tokens.brand, tokens.bg) },
    { key: 'onBrand', label: labels.onBrand, ratio: contrastRatio(tokens.onBrand, tokens.brand) },
    { key: 'accentOnBg', label: labels.accentOnBg, ratio: contrastRatio(tokens.accent, tokens.bg) },
    {
      key: 'inkOnSoft',
      label: labels.inkOnSoft,
      ratio: contrastRatio(tokens.brandInk, tokens.brandSoft),
    },
  ]

  return (
    <Group title={t.contrast.title}>
      <div className="contrast">
        {checks.map((check) => {
          const grade = gradeOf(check.ratio)
          return (
            <div key={check.key} className="contrast-row">
              <span className="contrast-name">{check.label}</span>
              <span>
                <b>{format.ratio(check.ratio)}</b>
                <span className={`tag tag-${grade}`}>{t.contrast.grades[grade]}</span>
              </span>
            </div>
          )
        })}
      </div>
    </Group>
  )
}
