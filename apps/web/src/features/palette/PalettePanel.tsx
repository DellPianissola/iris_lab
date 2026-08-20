import { PALETTE_KEYS, type Palette, type PaletteKey } from '@nomai/theme'
import { Help } from '../../components/Help'
import { DeriveIcon, InvertIcon, RandomIcon, RedoIcon, UndoIcon } from '../../components/icons'
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
    <>
      {/* Laid out as a strip rather than a stacked list: seven colours side by side can be
          compared at a glance, which is the judgement the tool exists to support. */}
      <div className="swatches">
        {PALETTE_KEYS.map((key) => (
          <ColorCard
            key={key}
            name={t.palette.tokens[key]}
            value={palette[key]}
            onChange={(value) => onColorChange(key, value)}
          />
        ))}
      </div>

      <div className="button-row">
        <button type="button" onClick={onRandomize}>
          <RandomIcon className="icon" aria-hidden="true" />
          {t.palette.randomize}
        </button>
        <span className="with-help">
          <button type="button" onClick={onHarmonize}>
            <DeriveIcon className="icon" aria-hidden="true" />
            {t.palette.harmonize}
          </button>
          <Help label={t.palette.harmonize}>{t.palette.note}</Help>
        </span>
        <button type="button" onClick={onInvert}>
          <InvertIcon className="icon" aria-hidden="true" />
          {t.palette.invert}
        </button>

        <span className="rule" aria-hidden="true" />

        <button type="button" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon className="icon" aria-hidden="true" />
          {t.palette.undo}
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon className="icon" aria-hidden="true" />
          {t.palette.redo}
        </button>
        <span className="with-help">
          <ShareButton />
          <Help label={t.palette.share}>{t.palette.shareNote}</Help>
        </span>
      </div>
    </>
  )
}

interface ColorCardProps {
  readonly name: string
  readonly value: string
  readonly onChange: (value: string) => void
}

function ColorCard({ name, value, onChange }: ColorCardProps) {
  return (
    <div className="swatch-card">
      <span className="swatch">
        <input
          type="color"
          aria-label={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <span className="swatch-name">{name}</span>
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
