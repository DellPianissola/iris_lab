import type { MarkMode } from '@nomai/svg-kit'
import { useState, type DragEvent } from 'react'
import { RangeField } from '../../components/Field'
import { Section } from '../../components/Section'
import { CloseIcon, UploadIcon } from '../../components/icons'
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
    <Section title={t.symbol.title} defaultOpen>
      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <UploadIcon className="icon icon-drop" aria-hidden="true" />
        {t.symbol.dropzone.line1}
        <br />
        {t.symbol.dropzone.line2}
        {/* `hidden` takes the field out of the tab order, and there was no other way to
            upload without a mouse. Hidden visually, it stays focusable. */}
        <input
          type="file"
          className="visually-hidden-input"
          multiple
          accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
          onChange={(event) => {
            void ingest(event.target.files)
            event.target.value = ''
          }}
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      {/* The remove button is a **sibling** of the select one, not a child: interactive
          content inside a <button> is invalid HTML, and the keyboard cannot reach the inner one. */}
      <div className="marks">
        {marks.map((item, index) => (
          <div key={item.id} className="mark">
            <button
              type="button"
              className="mark-select"
              aria-pressed={item.id === selectedId}
              aria-label={
                item.builtin ? t.symbol.selectBuiltin(index + 1) : t.symbol.select(item.name)
              }
              onClick={() => onSelect(item.id)}
            >
              <Glyph mark={item} forceOriginal />
            </button>
            {!item.builtin && (
              <button
                type="button"
                className="icon-button mark-remove"
                aria-label={t.symbol.remove(item.name)}
                onClick={() => onRemove(item.id)}
              >
                <CloseIcon className="icon" aria-hidden="true" />
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

    </Section>
  )
}
