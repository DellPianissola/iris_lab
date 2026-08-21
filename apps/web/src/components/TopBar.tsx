import type { ThemeMode } from '@nomai/theme'
import { Segmented } from './Field'
import { ChevronDownIcon, MoonIcon, SunIcon, SymbolIcon } from './icons'
import { LocalePicker } from './LocalePicker'
import { useI18n } from '../i18n'
import type { RefObject } from 'react'

interface TopBarProps {
  readonly mode: ThemeMode
  readonly onModeChange: (mode: ThemeMode) => void
  readonly shortcutKey: string
  readonly brandSheetId: string
  readonly brandSheetOpen: boolean
  readonly onBrandSheetToggle: () => void
  readonly brandButtonRef: RefObject<HTMLButtonElement | null>
}

/**
 * Identity plus what applies to the whole screen. Everything that edits the palette lives in
 * the toolbar at the bottom, so this bar never has to grow.
 *
 * The `<h1>` is here rather than in the tool: the landing page **is** the product, so the
 * page still owes a search engine a real heading.
 */
export function TopBar({
  mode,
  onModeChange,
  shortcutKey,
  brandSheetId,
  brandSheetOpen,
  onBrandSheetToggle,
  brandButtonRef,
}: TopBarProps) {
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

      {/* The controls scroll on their own so the identity stays put: four of them do not fit a
          phone, and clipping them silently is how the language picker became unreachable. */}
      <div className="topbar-actions">
        <span className="hint">{t.app.shortcutHint(shortcutKey)}</span>

        <button
          type="button"
          className="brand-toggle"
          ref={brandButtonRef}
          aria-expanded={brandSheetOpen}
          aria-controls={brandSheetId}
          onClick={onBrandSheetToggle}
        >
          <SymbolIcon className="icon" aria-hidden="true" />
          {t.brand.title}
          <ChevronDownIcon className="tool-caret" aria-hidden="true" />
        </button>

        <Segmented value={mode} options={modeOptions} onChange={onModeChange} />
        <LocalePicker />
      </div>
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
