import { PALETTE_KEYS, type Palette, type PaletteKey } from '@nomai/theme'
import { DeriveIcon, InvertIcon, RandomIcon, RedoIcon, UndoIcon } from '../../components/icons'
import { Help, Section } from '../../components/Section'
import { useI18n } from '../../i18n'
import { ShareButton } from './ShareButton'

interface PalettePanelProps {
  readonly palette: Palette
  readonly onColorChange: (key: PaletteKey, value: string) => void
  readonly onRandomize: () => void
  readonly onHarmonize: () => void
  readonly onInvert: () => void
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly canUndo: boolean
  readonly canRedo: boolean
}

export function PalettePanel({
  palette,
  onColorChange,
  onRandomize,
  onHarmonize,
  onInvert,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: PalettePanelProps) {
  const { t } = useI18n()

  return (
    <Section title={t.palette.title} defaultOpen>
      {PALETTE_KEYS.map((key) => (
        <ColorRow
          key={key}
          name={t.palette.tokens[key]}
          value={palette[key]}
          onChange={(value) => onColorChange(key, value)}
        />
      ))}

      <div className="button-row">
        <button type="button" onClick={onRandomize}>
          <RandomIcon className="icon" aria-hidden="true" />
          {t.palette.randomize}
        </button>
        <button type="button" onClick={onHarmonize}>
          <DeriveIcon className="icon" aria-hidden="true" />
          {t.palette.harmonize}
        </button>
        <button type="button" onClick={onInvert}>
          <InvertIcon className="icon" aria-hidden="true" />
          {t.palette.invert}
        </button>
        <Help label={t.palette.harmonize}>{t.palette.note}</Help>
      </div>

      <div className="button-row">
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon className="icon" aria-hidden="true" />
          {t.palette.undo}
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon className="icon" aria-hidden="true" />
          {t.palette.redo}
        </button>
        <ShareButton />
        <Help label={t.palette.share}>{t.palette.shareNote}</Help>
      </div>
    </Section>
  )
}

interface ColorRowProps {
  readonly name: string
  readonly value: string
  readonly onChange: (value: string) => void
}

function ColorRow({ name, value, onChange }: ColorRowProps) {
  return (
    <div className="color-row">
      <span className="swatch">
        <input
          type="color"
          aria-label={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <label>{name}</label>
      <input
        className="hex"
        value={value.toUpperCase()}
        spellCheck={false}
        aria-label={name}
        onChange={(event) => {
          const next = normalizeHexInput(event.target.value)
          if (next) onChange(next)
        }}
      />
    </div>
  )
}

function normalizeHexInput(raw: string): string | null {
  const value = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value.toLowerCase() : null
}
