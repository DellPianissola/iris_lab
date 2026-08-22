import { fonts } from '@nomai/theme'
import { RangeField, SelectField, TextField } from '../../components/Field'
import { Help } from '../../components/Help'
import { useI18n } from '../../i18n'
import { controlRanges, WORDMARK_SPLIT } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'

interface TypePanelProps {
  readonly controls: Controls
  readonly onChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void
}

export function TypePanel({ controls, onChange }: TypePanelProps) {
  const { t } = useI18n()

  const fontOptions = fonts.map((font) => ({
    id: font.id,
    name: t.typography.fonts[font.id],
  }))

  return (
    <div className="form-grid">
      <div className="with-help">
        <TextField
          label={t.typography.name}
          value={controls.wordmark}
          onChange={(v) => onChange('wordmark', v)}
        />
        <Help label={t.typography.name}>{t.typography.note(WORDMARK_SPLIT)}</Help>
      </div>
      <SelectField
        label={t.typography.display}
        value={controls.displayFont}
        options={fontOptions}
        onChange={(v) => onChange('displayFont', v)}
      />
      <SelectField
        label={t.typography.body}
        value={controls.bodyFont}
        options={fontOptions}
        onChange={(v) => onChange('bodyFont', v)}
      />
      <RangeField
        label={t.typography.tracking}
        value={controls.tracking}
        min={controlRanges.tracking.min}
        max={controlRanges.tracking.max}
        onChange={(v) => onChange('tracking', v)}
      />
      <RangeField
        label={t.typography.buttons}
        value={controls.buttonRadius}
        min={controlRanges.buttonRadius.min}
        max={controlRanges.buttonRadius.max}
        onChange={(v) => onChange('buttonRadius', v)}
      />
      <label className="check">
        <input
          type="checkbox"
          checked={controls.outlines}
          onChange={(event) => onChange('outlines', event.target.checked)}
        />
        {t.typography.outlines}
      </label>
    </div>
  )
}
