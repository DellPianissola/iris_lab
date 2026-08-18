import type { ThemeTokens } from '@nomai/theme'
import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'
import { faviconSizes, WORDMARK_SPLIT } from '../../state/config'
import { Glyph } from './Glyph'

interface FaviconPreviewProps {
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly wordmark: string
  readonly plate: boolean
}

export function FaviconPreview({ tokens, mark, wordmark, plate }: FaviconPreviewProps) {
  const { t } = useI18n()
  const background = plate ? tokens.brand : tokens.surface
  const foreground = plate ? tokens.onBrand : tokens.brandInk
  const boxStyle = { background, color: foreground, '--tone-0': foreground } as CSSProperties

  return (
    <div className="favicons">
      {faviconSizes.map((size) => (
        <figure key={size} className="favicon">
          <div className="favicon-box" style={{ ...boxStyle, width: size, height: size }}>
            <Glyph mark={mark} />
          </div>
          <figcaption>{size}px</figcaption>
        </figure>
      ))}

      <div className="tab-sim">
        <div className="favicon-box tab-icon" style={boxStyle}>
          <Glyph mark={mark} />
        </div>
        <span>
          {wordmark.split(WORDMARK_SPLIT).join('')} — {t.mockup.tabTitle}
        </span>
      </div>
    </div>
  )
}
