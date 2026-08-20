import type { ThemeMode } from '@nomai/theme'
import { Segmented } from './Field'
import { MoonIcon, SunIcon } from './icons'
import { LocalePicker } from './LocalePicker'
import { useI18n } from '../i18n'

interface TopBarProps {
  readonly mode: ThemeMode
  readonly onModeChange: (mode: ThemeMode) => void
  readonly shortcutKey: string
}

/**
 * Identity plus what applies to the whole screen. Everything that edits the palette lives in
 * the toolbar at the bottom, so this bar never has to grow.
 *
 * The `<h1>` is here rather than in the tool: the landing page **is** the product, so the
 * page still owes a search engine a real heading.
 */
export function TopBar({ mode, onModeChange, shortcutKey }: TopBarProps) {
  const { t } = useI18n()

  const modeOptions = [
    { id: 'light' as const, label: t.app.modes.light, icon: SunIcon },
    { id: 'dark' as const, label: t.app.modes.dark, icon: MoonIcon },
  ]

  return (
    <header className="topbar">
      <div className="brand">
        <IrisMark />
        <span className="brand-names">
          <h1>Íris</h1>
          <small>{t.app.company}</small>
        </span>
      </div>

      <span className="spacer" />

      <span className="hint">{t.app.shortcutHint(shortcutKey)}</span>
      <Segmented value={mode} options={modeOptions} onChange={onModeChange} />
      <LocalePicker />
    </header>
  )
}

/**
 * A placeholder standing in for the real logo, not the logo: an iris ring reduced to what
 * still reads at the size of the bar. It takes `currentColor` so the bar owns its colour, the
 * same rule the rest of the icon set follows.
 */
function IrisMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
}
