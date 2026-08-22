import { useEffect } from 'react'

/** Global shortcut, ignored while focus is in a field. */
export function useKeyboardShortcut(key: string, action: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() !== key) return
      if (isTypingTarget(event.target)) return
      if (event.ctrlKey || event.metaKey || event.altKey) return

      action()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, action])
}

/**
 * Ctrl+Z / Ctrl+Shift+Z, and Cmd on Mac.
 *
 * Stands down when focus is in a field: there the browser own undo is what the person
 * expects, and stealing it would make Ctrl+Z wipe the palette instead of reverting what they
 * just typed.
 */
export function useUndoShortcut(onUndo: () => void, onRedo: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() !== 'z') return
      if (!event.ctrlKey && !event.metaKey) return
      if (isTypingTarget(event.target)) return

      event.preventDefault()
      if (event.shiftKey) onRedo()
      else onUndo()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onUndo, onRedo])
}

function isTypingTarget(target: EventTarget | null): boolean {
  const tag = (target as HTMLElement | null)?.tagName
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'
}
