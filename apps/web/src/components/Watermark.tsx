import { useRef } from 'react'
import { NomaiLockup, NomaiMark } from './NomaiLogo'
import { useDisclosure } from './useDisclosure'
import { useI18n } from '../i18n'

interface WatermarkProps {
  readonly id: string
  readonly open: boolean
  readonly onToggle: () => void
  readonly onClose: () => void
}

/**
 * Our own mark, in the corner, out of the way of the customer's.
 *
 * It sits at the bottom rather than in a bar at the top because a bar at the top had the same
 * shape as the mockup's own header — logo left, actions right — and two of that shape stacked
 * read as two headers of the same thing. Down here nothing competes: the only full-width
 * header on screen is the one being tested.
 *
 * It carries the same height and the same fill as the bar beside it, because the two are the
 * same kind of object: the tool's own furniture, floating over someone else's page.
 */
export function Watermark({ id, open, onToggle, onClose }: WatermarkProps) {
  const { t } = useI18n()
  const trigger = useRef<HTMLButtonElement | null>(null)
  const { surface } = useDisclosure(open, onClose, trigger)

  return (
    <div className="watermark">
      {/* The page owes a search engine a real heading, and the identity no longer has a bar to
          live in. It stays in the document whether the card is open or not. */}
      <h1 className="sr-only">{t.app.fullName}</h1>

      <div
        className="sheet about"
        ref={surface}
        id={id}
        hidden={!open}
        role="region"
        aria-label={t.app.fullName}
      >
        <p className="about-name">
          <NomaiMark className="about-mark" />
          <NomaiLockup />
        </p>
        <p className="about-body">{t.app.about}</p>
      </div>

      <button
        type="button"
        className="watermark-toggle"
        ref={trigger}
        aria-expanded={open}
        aria-controls={id}
        aria-label={t.app.fullName}
        onClick={onToggle}
      >
        <NomaiMark className="watermark-mark" />
        <NomaiLockup withProduct />
      </button>
    </div>
  )
}
