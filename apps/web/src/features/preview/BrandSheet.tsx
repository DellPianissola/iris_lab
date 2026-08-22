import type { ThemeTokens } from '@nomai/theme'
import type { RefObject } from 'react'
import { CloseIcon } from '../../components/icons'
import { useDisclosure } from '../../components/useDisclosure'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'
import type { Controls } from '../../state/useBrandLab'
import { FaviconPreview } from './FaviconPreview'
import { LockupGrid } from './LockupGrid'

interface BrandSheetProps {
  readonly id: string
  readonly open: boolean
  readonly onClose: () => void
  /** The header button that opens it, so closing can hand the focus back. */
  readonly triggerRef: RefObject<HTMLButtonElement | null>
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly controls: Controls
  readonly glyphColor: string
}

/**
 * The logo on the four grounds it will land on, and the same mark at favicon sizes.
 *
 * These used to sit as two permanent cards above the mockup, and they were what gave the stage
 * away as a gallery of widgets. The stage is the fake landing page now — it has to read as a
 * site, because that is what the customer is judging — so the asset sheet comes down from the
 * header only when asked. It drops from the top rather than rising from the toolbar for the
 * same reason the controls rise: nobody is dragging a colour while inspecting the mark, so
 * covering the hero costs nothing here, and the two directions keep the roles apart.
 *
 * Escape and the focus hand-back live here rather than in the caller so the whole disclosure
 * contract can be tested as one unit.
 */
export function BrandSheet({
  id,
  open,
  onClose,
  triggerRef,
  tokens,
  mark,
  controls,
  glyphColor,
}: BrandSheetProps) {
  const { t } = useI18n()

  const { surface, close } = useDisclosure(open, onClose, triggerRef)

  return (
    <div
      className="sheet brand-sheet"
      ref={surface}
      id={id}
      hidden={!open}
      role="region"
      aria-label={t.brand.title}
    >
      <div className="sheet-head">
        <h2 className="sheet-cap">{t.brand.lockups}</h2>
        <button
          type="button"
          className="icon-button sheet-close"
          aria-label={t.app.closeTool}
          onClick={() => close()}
        >
          <CloseIcon className="icon" aria-hidden="true" />
        </button>
      </div>
      <LockupGrid tokens={tokens} mark={mark} controls={controls} glyphColor={glyphColor} />

      <h2 className="sheet-cap sheet-cap-next">{t.brand.favicon}</h2>
      <FaviconPreview
        tokens={tokens}
        mark={mark}
        wordmark={controls.wordmark}
        plate={controls.plate}
      />
    </div>
  )
}
