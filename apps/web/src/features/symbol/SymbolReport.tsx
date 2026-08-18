import type { MarkMode } from '@nomai/svg-kit'
import { Segmented } from '../../components/Field'
import type { Mark } from '../../marks/types'
import { kindReport, LOCKED_KIND, modeOptions, warningText } from './labels'

interface SymbolReportProps {
  readonly mark: Mark
  readonly onModeChange: (mode: MarkMode) => void
}

/**
 * O relatório que o cliente vê. Ele **nunca pergunta** o que fazer: mostra a conclusão e
 * oferece um interruptor de duas posições, já na posição certa, para discordar.
 */
export function SymbolReport({ mark, onModeChange }: SymbolReportProps) {
  const report = kindReport[mark.kind]
  const locked = mark.kind === LOCKED_KIND

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
        <p key={warning.code} className="report-warning">⚠ {warningText[warning.code]}</p>
      ))}

      <Segmented
        value={mark.mode}
        options={modeOptions.map((option) => ({
          ...option,
          disabled: locked && option.id === 'theme',
        }))}
        onChange={onModeChange}
      />
    </div>
  )
}
