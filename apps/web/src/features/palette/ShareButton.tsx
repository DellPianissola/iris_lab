import { useEffect, useRef, useState } from 'react'
import { CheckIcon, LinkIcon } from '../../components/icons'
import { useI18n } from '../../i18n'

/** Long enough to be noticed, short enough not to look stuck. */
const CONFIRMATION_MS = 2000

export function ShareButton() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Without this, copying and unmounting right after leaves the timer firing on a dead component.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS)
    } catch {
      // Clipboard denied (permission or insecure context). The URL is still in the address
      // bar, so the manual path exists — failing loudly here would not help.
    }
  }

  return (
    <>
      <button type="button" onClick={() => void copy()}>
        {copied ? (
          <CheckIcon className="icon" aria-hidden="true" />
        ) : (
          <LinkIcon className="icon" aria-hidden="true" />
        )}
        {t.palette.share}
      </button>

      {/* A separate region rather than `aria-live` on the button itself: with the label
          stable, the screen reader announces the confirmation once, not the whole button
          twice — on the change and again when it expires. */}
      <span className="sr-only" role="status">
        {copied ? t.palette.shared : ''}
      </span>
    </>
  )
}
