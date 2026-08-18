import { buildTokens, tokensToCssText, type Palette, type ThemeMode } from '@nomai/theme'
import { Group } from '../../components/Field'
import { CloseIcon, DownloadIcon, PlusIcon } from '../../components/icons'
import { useI18n } from '../../i18n'
import type { SavedCombo } from '../../state/useBrandLab'

const EXPORT_FILENAME = 'paleta.css'

interface SavedPanelProps {
  readonly palette: Palette
  readonly saved: readonly SavedCombo[]
  readonly onSave: () => void
  readonly onRemove: (id: string) => void
  readonly onApply: (palette: Palette, mode: ThemeMode) => void
}

export function SavedPanel({ palette, saved, onSave, onRemove, onApply }: SavedPanelProps) {
  const { t } = useI18n()

  function downloadCss(): void {
    const blocks = [
      tokensToCssText(buildTokens(palette), 'paleta atual'),
      ...saved.map((combo, index) =>
        tokensToCssText(buildTokens(combo.palette), `salva #${index + 1}`),
      ),
    ]

    const blob = new Blob([blocks.join('\n')], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = EXPORT_FILENAME

    // O âncora precisa estar no documento em alguns navegadores, e revogar a URL na linha
    // seguinte ao clique corre com o download, que começa de forma assíncrona.
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <Group title={t.saved.title}>
      <div className="button-row">
        <button type="button" className="primary" onClick={onSave}>
          <PlusIcon className="icon" aria-hidden="true" />
          {t.saved.save}
        </button>
        <button type="button" onClick={downloadCss}>
          <DownloadIcon className="icon" aria-hidden="true" />
          {t.saved.download}
        </button>
      </div>

      {saved.length === 0 ? (
        <p className="note">{t.saved.empty}</p>
      ) : (
        <div className="chips">
          {saved.map((combo, index) => (
            <span key={combo.id} className="chip">
              <button type="button" onClick={() => onApply(combo.palette, combo.mode)}>
                <i style={{ background: combo.palette.brand }} />
                <i style={{ background: combo.palette.accent }} />
                <b>#{index + 1}</b>
              </button>
              <button
                type="button"
                className="chip-remove"
                aria-label={t.saved.remove(index + 1)}
                onClick={() => onRemove(combo.id)}
              >
                <CloseIcon className="icon" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="note">{t.saved.note}</p>
    </Group>
  )
}
