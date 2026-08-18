import { fonts } from '@nomai/theme'
import { Group, RangeField, SelectField, TextField } from '../../components/Field'
import { controlRanges, WORDMARK_SPLIT } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'

interface TypePanelProps {
  readonly controls: Controls
  readonly onChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void
}

export function TypePanel({ controls, onChange }: TypePanelProps) {
  return (
    <Group title="Nome / tipografia">
      <TextField label="Nome" value={controls.wordmark} onChange={(v) => onChange('wordmark', v)} />
      <SelectField
        label="Display"
        value={controls.displayFont}
        options={fonts}
        onChange={(v) => onChange('displayFont', v)}
      />
      <SelectField
        label="Texto"
        value={controls.bodyFont}
        options={fonts}
        onChange={(v) => onChange('bodyFont', v)}
      />
      <RangeField
        label="Espaçamento"
        value={controls.tracking}
        min={controlRanges.tracking.min}
        max={controlRanges.tracking.max}
        onChange={(v) => onChange('tracking', v)}
      />
      <RangeField
        label="Botões"
        value={controls.buttonRadius}
        min={controlRanges.buttonRadius.min}
        max={controlRanges.buttonRadius.max}
        onChange={(v) => onChange('buttonRadius', v)}
      />
      <p className="note">
        Use <code>{WORDMARK_SPLIT}</code> no nome pra destacar a segunda parte na cor da marca.
      </p>
    </Group>
  )
}
