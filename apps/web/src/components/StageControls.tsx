import type { ThemeMode } from '@nomai/theme'
import type { RefObject } from 'react'
import { Segmented } from './Field'
import { ChevronDownIcon, MoonIcon, SunIcon, SymbolIcon } from './icons'
import { LocalePicker } from './LocalePicker'
import { useI18n } from '../i18n'

interface StageControlsProps {
  readonly mode: ThemeMode
  readonly onModeChange: (mode: ThemeMode) => void
  readonly brandSheetId: string
  readonly brandSheetOpen: boolean
  readonly onBrandSheetToggle: () => void
  readonly brandButtonRef: RefObject<HTMLButtonElement | null>
}

/**
 * What applies to the whole screen, floating in the top right of the stage.
 *
 * There is no bar of ours any more. A bar with a logo on the left and actions on the right is
 * the same shape the mockup's own header uses, and two of that shape stacked read as two
 * headers of one thing. This cluster takes the place the fake site's own call-to-action pair
 * used to occupy — those buttons are gone from the nav, and the hero still exercises a
 * primary, a secondary and an accent, so nothing about the palette went untested.
 */
export function StageControls({
  mode,
  onModeChange,
  brandSheetId,
  brandSheetOpen,
  onBrandSheetToggle,
  brandButtonRef,
}: StageControlsProps) {
  const { t } = useI18n()

  const modeOptions = [
    { id: 'light' as const, label: t.app.modes.light, icon: SunIcon },
    { id: 'dark' as const, label: t.app.modes.dark, icon: MoonIcon },
  ]

  return (
    <div className="stage-controls">
      <button
        type="button"
        className="brand-toggle"
        ref={brandButtonRef}
        aria-expanded={brandSheetOpen}
        aria-controls={brandSheetId}
        title={t.brand.hint}
        onClick={onBrandSheetToggle}
      >
        <SymbolIcon className="icon" aria-hidden="true" />
        {t.brand.title}
        {/* The visible word alone does not say what opens, and a `title` never reaches a
            screen reader. */}
        <span className="sr-only">{t.brand.hint}</span>
        <ChevronDownIcon className="tool-caret" aria-hidden="true" />
      </button>

      <Segmented value={mode} options={modeOptions} onChange={onModeChange} />
      <LocalePicker />
    </div>
  )
}
