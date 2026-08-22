import { useCallback, useRef, type RefObject } from 'react'
import { useDismiss, type DismissReason } from './useDismiss'

/**
 * A panel that opens from a button: Escape and an outside pointer both close it, and only
 * Escape hands the focus back.
 *
 * The brand sheet and the watermark card were writing the same four lines each, which meant
 * the keyboard rule lived in two places and could drift in one. The toolbar keeps its own,
 * because it closes from whichever of six tabs was open rather than from a single button.
 */
export function useDisclosure(
  isOpen: boolean,
  onClose: () => void,
  trigger: RefObject<HTMLButtonElement | null>,
): {
  readonly surface: RefObject<HTMLDivElement | null>
  /** For a close button inside the panel: it disappears with the panel, so focus has to move. */
  readonly close: () => void
} {
  const surface = useRef<HTMLDivElement | null>(null)

  const close = useCallback(
    (reason: DismissReason = 'escape') => {
      if (reason === 'escape') trigger.current?.focus()
      onClose()
    },
    [trigger, onClose],
  )

  useDismiss(isOpen, close, surface, trigger)

  return { surface, close }
}
