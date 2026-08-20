import type { MarkMode } from '@nomai/svg-kit'
import { Segmented } from '../../components/Field'
import { WarningIcon } from '../../components/icons'
import { Help } from '../../components/Help'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'

/** An opaque bitmap cannot follow the theme: colouring it would produce a rectangle. */
const LOCKED_KIND = 'raster-opaque'

interface SymbolReportProps {
  readonly mark: Mark
  readonly onModeChange: (mode: MarkMode) => void
}

/**
 * The interface **never asks** what to do: it shows the conclusion and offers a two-position
 * switch, already in the right position, for the customer to disagree.
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
          <WarningIcon className="icon" aria-hidden="true" />
          {t.symbol.warnings[warning.code]}
        </p>
      ))}

      <div className="with-help">
        <Segmented value={mark.mode} options={options} onChange={onModeChange} />
        <Help label={t.symbol.title}>{t.symbol.note}</Help>
      </div>
    </div>
  )
}
