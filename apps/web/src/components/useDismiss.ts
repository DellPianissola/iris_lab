import { useEffect } from 'react'

/**
 * Escape closes whatever is open. Shared by the toolbar drawer and the brand sheet, which are
 * the same disclosure pointing in opposite directions.
 *
 * The flag is a boolean on purpose. Keying this on the open *object* re-subscribes the
 * listener on every render, because the list it is found in is rebuilt each time — measured at
 * one add/remove pair per colour the picker emits during a drag.
 */
export function useDismiss(isOpen: boolean, close: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])
}
