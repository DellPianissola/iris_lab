import { useId, useState, type ReactNode } from 'react'
import { HelpIcon } from './icons'
import { useI18n } from '../i18n'

interface HelpProps {
  readonly label: string
  readonly children: ReactNode
}

/**
 * Explanation on demand instead of a permanent grey paragraph. A disclosure rather than a
 * floating popover: no positioning to get wrong, no outside-click to trap, and the keyboard
 * works without any of it being written here.
 *
 * The paragraph is always in the DOM and hidden with `hidden`, never unmounted: an
 * `aria-controls` pointing at an id that does not exist is an ARIA violation, and it is the
 * closed state — the default — that would carry it.
 */
export function Help({ label, children }: HelpProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <>
      <button
        type="button"
        className="icon-button help-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={t.app.help(label)}
        onClick={() => setOpen((current) => !current)}
      >
        <HelpIcon className="icon" aria-hidden="true" />
      </button>
      <p className="help-body" id={id} hidden={!open}>
        {children}
      </p>
    </>
  )
}
