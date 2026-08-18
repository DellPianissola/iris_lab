import type { MarkMode } from '@nomai/svg-kit'
import { useState, type DragEvent } from 'react'
import { Group, RangeField } from '../../components/Field'
import type { Mark } from '../../marks/types'
import { readMarkFile } from '../../marks/load'
import { controlRanges } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Glyph } from '../preview/Glyph'
import { SymbolReport } from './SymbolReport'

interface SymbolPanelProps {
  readonly marks: readonly Mark[]
  readonly mark: Mark | undefined
  readonly markIndex: number
  readonly controls: Controls
  readonly onSelect: (index: number) => void
  readonly onAdd: (mark: Mark) => void
  readonly onRemove: (id: string) => void
  readonly onModeChange: (id: string, mode: MarkMode) => void
  readonly onControlChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void
}

export function SymbolPanel({
  marks,
  mark,
  markIndex,
  controls,
  onSelect,
  onAdd,
  onRemove,
  onModeChange,
  onControlChange,
}: SymbolPanelProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ingest(files: FileList | null): Promise<void> {
    if (!files) return
    setError(null)

    for (const file of Array.from(files)) {
      const next = await readMarkFile(file)
      if (next) onAdd(next)
      else setError(`Não consegui ler “${file.name}”. O arquivo parece corrompido.`)
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault()
    setDragging(false)
    void ingest(event.dataTransfer.files)
  }

  return (
    <Group title="Símbolo">
      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        Arraste seus <b>SVG / PNG</b> aqui
        <br />
        ou clique pra escolher
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

      {error && <p className="error">{error}</p>}

      <div className="marks">
        {marks.map((item, index) => (
          <div
            key={item.id}
            className={index === markIndex ? 'mark selected' : 'mark'}
            onClick={() => onSelect(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === 'Enter') onSelect(index) }}
          >
            <Glyph mark={{ ...item, mode: 'original' }} />
            {!item.builtin && (
              <button
                type="button"
                className="mark-remove"
                aria-label={`remover ${item.name}`}
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
        Símbolo dentro de uma plaquinha (fundo brand)
      </label>

      <RangeField
        label="Tamanho"
        value={controls.markSize}
        min={controlRanges.markSize.min}
        max={controlRanges.markSize.max}
        onChange={(value) => onControlChange('markSize', value)}
      />
      <RangeField
        label="Cantos"
        value={controls.markRadius}
        min={controlRanges.markRadius.min}
        max={controlRanges.markRadius.max}
        onChange={(value) => onControlChange('markRadius', value)}
      />

      <p className="note">
        Ao subir um arquivo, ele é analisado: contamos as cores reais (inclusive as escondidas
        em CSS interno) e já escolhemos se ele deve seguir o tema ou manter as próprias cores.
        O botão acima só existe pra você discordar.
      </p>
    </Group>
  )
}
