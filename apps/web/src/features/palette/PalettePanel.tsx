import { PALETTE_KEYS, type Palette, type PaletteKey } from '@nomai/theme'
import { Group } from '../../components/Field'

const LABELS: Readonly<Record<PaletteKey, string>> = {
  brand: 'Principal',
  accent: 'Acento',
  bg: 'Fundo',
  surface: 'Superfície',
  text: 'Texto',
  muted: 'Texto suave',
  line: 'Bordas',
}

interface PalettePanelProps {
  readonly palette: Palette
  readonly onColorChange: (key: PaletteKey, value: string) => void
  readonly onRandomize: () => void
  readonly onHarmonize: () => void
  readonly onInvert: () => void
}

export function PalettePanel({
  palette,
  onColorChange,
  onRandomize,
  onHarmonize,
  onInvert,
}: PalettePanelProps) {
  return (
    <Group title="Paleta">
      {PALETTE_KEYS.map((key) => (
        <ColorRow key={key} name={LABELS[key]} value={palette[key]} onChange={(v) => onColorChange(key, v)} />
      ))}

      <div className="button-row">
        <button type="button" onClick={onRandomize}>🎲 Aleatório</button>
        <button type="button" onClick={onHarmonize}>✨ Derivar do brand</button>
        <button type="button" onClick={onInvert}>↔ Inverter claro/escuro</button>
      </div>
      <p className="note">
        “Derivar do brand” recalcula fundo, superfície, texto e acento a partir da cor principal.
      </p>
    </Group>
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
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
      <label>{name}</label>
      <input
        className="hex"
        value={value.toUpperCase()}
        spellCheck={false}
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
