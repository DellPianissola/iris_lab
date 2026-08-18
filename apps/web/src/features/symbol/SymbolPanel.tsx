import type { MarkMode } from '@nomai/svg-kit'
import { useState, type DragEvent } from 'react'
import { Group, RangeField } from '../../components/Field'
import { useI18n } from '../../i18n'
import { readMarkFile } from '../../marks/load'
import type { Mark } from '../../marks/types'
import { controlRanges, uploadLimits } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Glyph } from '../preview/Glyph'
import { SymbolReport } from './SymbolReport'

interface SymbolPanelProps {
  readonly marks: readonly Mark[]
  readonly mark: Mark | undefined
  readonly selectedId: string
  readonly controls: Controls
  readonly onSelect: (id: string) => void
  readonly onAdd: (mark: Mark) => void
  readonly onRemove: (id: string) => void
  readonly onModeChange: (id: string, mode: MarkMode) => void
  readonly onControlChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void
}

export function SymbolPanel({
  marks,
  mark,
  selectedId,
  controls,
  onSelect,
  onAdd,
  onRemove,
  onModeChange,
  onControlChange,
}: SymbolPanelProps) {
  const { t, format } = useI18n()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ingest(files: FileList | null): Promise<void> {
    if (!files) return
    setError(null)

    for (const file of Array.from(files)) {
      const result = await readMarkFile(file)
      if (result.ok) {
        onAdd(result.mark)
      } else if (result.reason === 'too-large') {
        setError(t.symbol.failures['too-large'](file.name, format.megabytes(uploadLimits.maxBytes)))
      } else {
        setError(t.symbol.failures.unreadable(file.name))
      }
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault()
    setDragging(false)
    void ingest(event.dataTransfer.files)
  }

  return (
    <Group title={t.symbol.title}>
      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {t.symbol.dropzone.line1}
        <br />
        {t.symbol.dropzone.line2}
        <input
          type="file"
          hidden
          multiple
          accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
          onChange={(event) => {
            void ingest(event.target.files)
            event.target.value = ''
          }}
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="marks">
        {marks.map((item) => (
          <div
            key={item.id}
            className={item.id === selectedId ? 'mark selected' : 'mark'}
            onClick={() => onSelect(item.id)}
            role="button"
            tabIndex={0}
            aria-pressed={item.id === selectedId}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(item.id)
              }
            }}
          >
            <Glyph mark={item} forceOriginal />
            {!item.builtin && (
              <button
                type="button"
                className="mark-remove"
                aria-label={t.symbol.remove(item.name)}
                onClick={(event) => { event.stopPropagation(); onRemove(item.id) }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {mark && !mark.builtin && (
        <SymbolReport mark={mark} onModeChange={(next) => onModeChange(mark.id, next)} />
      )}

      <label className="check">
        <input
          type="checkbox"
          checked={controls.plate}
          onChange={(event) => onControlChange('plate', event.target.checked)}
        />
        {t.symbol.plate}
      </label>

      <RangeField
        label={t.symbol.size}
        value={controls.markSize}
        min={controlRanges.markSize.min}
        max={controlRanges.markSize.max}
        onChange={(value) => onControlChange('markSize', value)}
      />
      <RangeField
        label={t.symbol.corners}
        value={controls.markRadius}
        min={controlRanges.markRadius.min}
        max={controlRanges.markRadius.max}
        onChange={(value) => onControlChange('markRadius', value)}
      />

      <p className="note">{t.symbol.note}</p>
    </Group>
  )
}
