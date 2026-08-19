import type { MarkMode } from '@nomai/svg-kit'
import {
  brandPalette,
  buildTokens,
  deriveNeutrals,
  harmonizeAccent,
  randomPalette,
  type FontId,
  type Palette,
  type PaletteKey,
  type ThemeMode,
} from '@nomai/theme'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { builtinMarks } from '../marks/load'
import type { Mark } from '../marks/types'
import { controlDefaults, STORAGE_KEY } from './config'
import {
  canRedo,
  canUndo,
  initHistory,
  record,
  redo,
  undo,
  type History,
} from './history'
import { markById, selectionAfterRemoval } from './selection'
import { decodeShare, encodeShare, isCompletePalette } from './share'

export interface SavedCombo {
  readonly id: string
  readonly palette: Palette
  readonly mode: ThemeMode
}

export interface Controls {
  plate: boolean
  markSize: number
  markRadius: number
  wordmark: string
  displayFont: FontId
  bodyFont: FontId
  tracking: number
  buttonRadius: number
}

/** The pair that undo and the shared link govern together. */
interface Look {
  readonly palette: Palette
  readonly mode: ThemeMode
}

/**
 * All of the tool state in one place. Components receive values and actions — none of them
 * holds state of its own or computes a token.
 *
 * The selected symbol is identified by **id**, not by position: an index and a list are two
 * states that can disagree, and keeping them in agreement meant coupling the two `setState`
 * calls.
 */
export function useBrandLab() {
  const [look, setLook] = useState<History<Look>>(() => initHistory(initialLook()))
  const [marks, setMarks] = useState<readonly Mark[]>(builtinMarks)
  const [selectedId, setSelectedId] = useState(() => builtinMarks[0]?.id ?? '')
  const [controls, setControls] = useState<Controls>({ ...controlDefaults })
  const [saved, setSaved] = useState<readonly SavedCombo[]>(loadSaved)

  const { palette, mode } = look.present

  useEffect(() => {
    // `replaceState` rather than `location.hash`: assigning to the hash pushes a history
    // entry per colour change, and the browser Back button would stop being useful.
    const next = `${location.pathname}${location.search}#${encodeShare(palette, mode)}`
    history.replaceState(null, '', next)
  }, [palette, mode])

  useEffect(() => {
    // Pasting a shared link into the address bar changes only the hash, and that does
    // **not** reload the page: without listening for `hashchange`, the link arrived and the
    // effect above overwrote it a moment later. `replaceState` does not fire this event, so
    // only human navigation lands here.
    function onHashChange(): void {
      const shared = decodeShare(location.hash)
      // In a local const: the type guard narrowing does not cross the closure below.
      const sharedPalette = shared.palette
      if (!isCompletePalette(sharedPalette)) return

      setLook((current) => {
        const next = { palette: sharedPalette, mode: shared.mode ?? current.present.mode }
        // Comparing through the serialiser rather than token by token: stays correct if the
        // palette gains a new token.
        const igual =
          encodeShare(next.palette, next.mode) ===
          encodeShare(current.present.palette, current.present.mode)

        // Recording it as a step allows undoing the link arrival instead of losing whatever
        // was on screen.
        return igual ? current : record(current, next)
      })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Storage full or disabled. Losing persistence is acceptable; freezing the tool over
      // it is not.
    }
  }, [saved])

  const tokens = useMemo(() => buildTokens(palette), [palette])
  const mark = useMemo(() => markById(marks, selectedId), [marks, selectedId])

  const setColor = useCallback((key: PaletteKey, value: string) => {
    setLook((current) =>
      record(
        current,
        { ...current.present, palette: { ...current.present.palette, [key]: value } },
        // The key is the token: a whole drag on one picker becomes a single step, but
        // adjusting the accent and then the borders stays two undoable steps.
        key,
      ),
    )
  }, [])

  const applyPalette = useCallback(
    (next: Palette, nextMode?: ThemeMode) => {
      setLook((current) => record(current, { palette: next, mode: nextMode ?? current.present.mode }))
    },
    [],
  )

  const switchMode = useCallback((next: ThemeMode) => {
    setLook((current) =>
      record(current, {
        mode: next,
        palette: { ...current.present.palette, ...deriveNeutrals(current.present.palette.brand, next) },
      }),
    )
  }, [])

  const harmonize = useCallback(() => {
    setLook((current) => {
      const { palette: base, mode: currentMode } = current.present
      return record(current, {
        mode: currentMode,
        palette: {
          ...base,
          accent: harmonizeAccent(base.brand, currentMode),
          ...deriveNeutrals(base.brand, currentMode),
        },
      })
    })
  }, [])

  const randomize = useCallback(() => {
    setLook((current) =>
      record(current, { mode: current.present.mode, palette: randomPalette(current.present.mode) }),
    )
  }, [])

  // Functional updater because uploading several files calls this in sequence with no
  // re-render in between. Selecting by id does not depend on the list, so the two `setState`
  // calls stay independent.
  const addMark = useCallback((next: Mark) => {
    setMarks((current) => [...current, next])
    setSelectedId(next.id)
  }, [])

  const removeMark = useCallback(
    (id: string) => {
      setSelectedId(selectionAfterRemoval(marks, id, selectedId))
      setMarks((current) => current.filter((item) => item.id !== id))
    },
    [marks, selectedId],
  )

  const setMarkMode = useCallback((id: string, next: MarkMode) => {
    setMarks((current) => current.map((item) => (item.id === id ? { ...item, mode: next } : item)))
  }, [])

  const updateControl = useCallback(<K extends keyof Controls>(key: K, value: Controls[K]) => {
    setControls((current) => ({ ...current, [key]: value }))
  }, [])

  const savePalette = useCallback(() => {
    setSaved((current) => [...current, { id: crypto.randomUUID(), palette, mode }])
  }, [palette, mode])

  const removeSaved = useCallback((id: string) => {
    setSaved((current) => current.filter((item) => item.id !== id))
  }, [])

  return {
    mode,
    palette,
    tokens,
    marks,
    mark,
    selectedId,
    controls,
    saved,
    canUndo: canUndo(look),
    canRedo: canRedo(look),
    actions: {
      setColor,
      applyPalette,
      switchMode,
      harmonize,
      randomize,
      undo: useCallback(() => setLook(undo), []),
      redo: useCallback(() => setLook(redo), []),
      selectMark: setSelectedId,
      addMark,
      removeMark,
      setMarkMode,
      updateControl,
      savePalette,
      removeSaved,
    },
  }
}

/** A shared link wins; without one, the house palette. */
function initialLook(): Look {
  const shared = decodeShare(location.hash)
  const mode = shared.mode ?? 'light'

  return isCompletePalette(shared.palette)
    ? { palette: shared.palette, mode }
    : { palette: brandPalette(mode), mode }
}

function loadSaved(): readonly SavedCombo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedCombo[]) : []
  } catch {
    // Storage full, disabled, or holding data from an older version: starting empty beats
    // preventing the tool from opening.
    return []
  }
}
