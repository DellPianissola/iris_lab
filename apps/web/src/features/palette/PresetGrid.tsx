import { presets, type Palette, type ThemeMode } from '@nomai/theme'
import { Section } from '../../components/Section'
import { useI18n } from '../../i18n'

interface PresetGridProps {
  readonly onPick: (palette: Palette, mode: ThemeMode) => void
}

export function PresetGrid({ onPick }: PresetGridProps) {
  const { t } = useI18n()

  return (
    <Section title={t.presets.title}>
      <div className="presets">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => onPick(preset.colors, preset.mode)}>
            <span className="preset-dots">
              <i style={{ background: preset.colors.brand }} />
              <i style={{ background: preset.colors.accent }} />
              <i style={{ background: preset.colors.bg }} />
            </span>
            <span>{t.presets.names[preset.id]}</span>
          </button>
        ))}
      </div>
    </Section>
  )
}
