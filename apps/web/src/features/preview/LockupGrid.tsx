import { isDark, type ThemeTokens } from '@nomai/theme'
import type { CSSProperties } from 'react'
import type { Mark } from '../../marks/types'
import { lockupScale } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Lockup } from './Lockup'
import { lockupBackdrops } from './content'

interface LockupGridProps {
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly controls: Controls
  readonly glyphColor: string
}

/** O logo nos quatro fundos em que ele vai aparecer de verdade. */
export function LockupGrid({ tokens, mark, controls, glyphColor }: LockupGridProps) {
  const darkBackground = isDark(tokens.bg)
  const monoBackground = darkBackground ? '#ffffff' : '#111111'
  const monoInk = darkBackground ? '#111111' : '#ffffff'

  const backdropStyles: Record<string, { background: string; ink: string; glyph: string }> = {
    bg: { background: tokens.bg, ink: tokens.text, glyph: glyphColor },
    surface: { background: tokens.surface, ink: tokens.text, glyph: glyphColor },
    brand: { background: tokens.brand, ink: tokens.onBrand, glyph: tokens.onBrand },
    mono: { background: monoBackground, ink: monoInk, glyph: monoInk },
  }

  return (
    <div className="lockups">
      {lockupBackdrops.map((backdrop) => {
        const style = backdropStyles[backdrop.id]
        if (!style) return null

        // Nos fundos sólidos a plaquinha atrapalha: ela vira ruído em cima da própria marca.
        const platePerBackdrop = backdrop.id === 'brand' || backdrop.id === 'mono'
          ? 'transparent'
          : undefined

        return (
          <div
            key={backdrop.id}
            className="lockup-cell"
            style={
              {
                background: style.background,
                color: style.ink,
                '--glyph-color': style.glyph,
                ...(platePerBackdrop ? { '--mark-plate': platePerBackdrop } : {}),
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
            <small style={{ color: style.ink }}>{backdrop.label}</small>
          </div>
        )
      })}
    </div>
  )
}
