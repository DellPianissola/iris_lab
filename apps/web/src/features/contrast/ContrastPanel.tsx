import { contrastRatio } from '@nomai/color'
import { gradeOf, type ContrastGrade, type ThemeTokens } from '@nomai/theme'
import { Group } from '../../components/Field'

const GRADE_LABELS: Readonly<Record<ContrastGrade, string>> = {
  aaa: 'AAA',
  aa: 'AA',
  large: 'AA grande',
  fail: 'falha',
}

interface ContrastPanelProps {
  readonly tokens: ThemeTokens
}

export function ContrastPanel({ tokens }: ContrastPanelProps) {
  const checks = [
    ['Texto / fundo', contrastRatio(tokens.text, tokens.bg)],
    ['Texto suave / fundo', contrastRatio(tokens.muted, tokens.bg)],
    ['Marca / fundo', contrastRatio(tokens.brand, tokens.bg)],
    ['Botão (texto/marca)', contrastRatio(tokens.onBrand, tokens.brand)],
    ['Acento / fundo', contrastRatio(tokens.accent, tokens.bg)],
    ['Marca como texto (pílula)', contrastRatio(tokens.brandInk, tokens.brandSoft)],
  ] as const

  return (
    <Group title="Contraste (WCAG)">
      <div className="contrast">
        {checks.map(([name, ratio]) => {
          const grade = gradeOf(ratio)
          return (
            <div key={name} className="contrast-row">
              <span className="contrast-name">{name}</span>
              <span>
                <b>{ratio.toFixed(2)}</b>
                <span className={`tag tag-${grade}`}>{GRADE_LABELS[grade]}</span>
              </span>
            </div>
          )
        })}
      </div>
    </Group>
  )
}
