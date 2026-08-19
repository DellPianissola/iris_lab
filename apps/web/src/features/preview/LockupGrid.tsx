import { isDark, type ThemeTokens } from '@nomai/theme'
import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'
import { lockupScale } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Lockup } from './Lockup'
import { lockupBackdropIds } from './mockup-data'

interface LockupGridProps {
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly controls: Controls
  readonly glyphColor: string
}

/** The logo on the four grounds it will actually appear on. */
export function LockupGrid({ tokens, mark, controls, glyphColor }: LockupGridProps) {
  const { t } = useI18n()
  const darkBackground = isDark(tokens.bg)
  const monoBackground = darkBackground ? '#ffffff' : '#111111'
  const monoInk = darkBackground ? '#111111' : '#ffffff'

  const styles = {
    bg: { background: tokens.bg, ink: tokens.text, glyph: glyphColor },
    surface: { background: tokens.surface, ink: tokens.text, glyph: glyphColor },
    brand: { background: tokens.brand, ink: tokens.onBrand, glyph: tokens.onBrand },
    mono: { background: monoBackground, ink: monoInk, glyph: monoInk },
  } as const

  return (
    <div className="lockups">
      {lockupBackdropIds.map((id) => {
        const style = styles[id]
        // On solid grounds the plate gets in the way: it becomes noise on top of the brand itself.
        const neutralisePlate = id === 'brand' || id === 'mono'

        return (
          <div
            key={id}
            className="lockup-cell"
            style={
              {
                background: style.background,
                color: style.ink,
                '--glyph-color': style.glyph,
                ...(neutralisePlate ? { '--mark-plate': 'transparent' } : {}),
              } as CSSProperties
            }
          >
            <Lockup
              mark={mark}
              wordmark={controls.wordmark}
              markSize={controls.markSize}
              wordSize={Math.round(controls.markSize * lockupScale.navWord)}
              textColor={style.ink}
            />
            <small style={{ color: style.ink }}>{t.mockup.backdrops[id]}</small>
          </div>
        )
      })}
    </div>
  )
}
