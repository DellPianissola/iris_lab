import type { MarkMode } from '@nomai/svg-kit'
import { Segmented } from '../../components/Field'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'

/** Bitmap opaco não tem como seguir o tema: colorir viraria um retângulo. */
const LOCKED_KIND = 'raster-opaque'

interface SymbolReportProps {
  readonly mark: Mark
  readonly onModeChange: (mode: MarkMode) => void
}

/**
 * A interface **nunca pergunta** o que fazer: mostra a conclusão e oferece um interruptor de
 * duas posições, já na posição certa, para o cliente discordar.
 */
export function SymbolReport({ mark, onModeChange }: SymbolReportProps) {
  const { t } = useI18n()
  const report = t.symbol.kinds[mark.kind]
  const locked = mark.kind === LOCKED_KIND

  const options: readonly { id: MarkMode; label: string; disabled: boolean }[] = [
    { id: 'theme', label: t.symbol.modes.theme, disabled: locked },
    { id: 'original', label: t.symbol.modes.original, disabled: false },
  ]

  return (
    <div className="report">
      <div className="report-title">
        {report.title}
        {mark.palette.length > 0 && (
          <span className="report-dots">
            {mark.palette.slice(0, 6).map((hex) => (
              <i key={hex} style={{ background: hex }} title={hex} />
            ))}
          </span>
        )}
      </div>
      <p className="report-body">{report.body}</p>

      {mark.warnings.map((warning) => (
        <p key={warning.code} className="report-warning">
          ⚠ {t.symbol.warnings[warning.code]}
        </p>
      ))}

      <Segmented value={mark.mode} options={options} onChange={onModeChange} />
    </div>
  )
}
