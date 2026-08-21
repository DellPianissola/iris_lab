import { useEffect, type RefObject } from 'react'

/**
 * Why the surface is closing. The two are not the same gesture: Escape is the keyboard asking
 * to leave, so the focus goes back to the control that opened the panel; a click outside is a
 * pointer going somewhere else, and dragging the focus back would take it off whatever the
 * person just clicked.
 */
export type DismissReason = 'escape' | 'outside'

/**
 * Escape, and a pointer landing outside. Shared by the toolbar drawer and the brand sheet,
 * which are the same disclosure pointing in opposite directions.
 *
 * The open flag is a boolean on purpose. Keying this on the open *object* re-subscribes the
 * listeners on every render, because the list it is found in is rebuilt each time — measured
 * at one add/remove pair per colour the picker emits during a drag. The refs are stable across
 * renders, so they can sit in the dependency list as they are.
 *
 * `pointerdown` rather than `click`: it fires before the click reaches a trigger inside
 * `surface`, so a second press on the button that opened the panel still toggles it closed
 * once instead of closing and reopening.
 */
export function useDismiss(
  isOpen: boolean,
  dismiss: (reason: DismissReason) => void,
  surface: RefObject<HTMLElement | null>,
  trigger?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') dismiss('escape')
    }

    function onPointerDown(event: PointerEvent): void {
      const target = event.target
      if (!(target instanceof Node)) return
      if (surface.current?.contains(target)) return
      if (trigger?.current?.contains(target)) return

      dismiss('outside')
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen, dismiss, surface, trigger])
}
