import {
  brandPalette,
  buildTokens,
  deriveNeutrals,
  harmonizeAccent,
  randomPalette,
  type Palette,
  type PaletteKey,
  type ThemeMode,
} from '@nomai/theme'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Mark, MarkModeChoice } from './types'
import { builtinMarks } from '../marks/load'
import { controlDefaults, STORAGE_KEY } from './config'

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
  displayFont: string
  bodyFont: string
  tracking: number
  buttonRadius: number
}

/**
 * Todo o estado da ferramenta num lugar só. Os componentes recebem valores e ações —
 * nenhum deles guarda estado próprio nem calcula token.
 */
export function useBrandLab() {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [palette, setPalette] = useState<Palette>(() => brandPalette('light'))
  const [marks, setMarks] = useState<readonly Mark[]>(builtinMarks)
  const [markIndex, setMarkIndex] = useState(0)
  const [controls, setControls] = useState<Controls>({ ...controlDefaults })
  const [saved, setSaved] = useState<readonly SavedCombo[]>(loadSaved)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  const tokens = useMemo(() => buildTokens(palette), [palette])
  const mark = marks[markIndex] ?? marks[0]

  const setColor = useCallback((key: PaletteKey, value: string) => {
    setPalette((current) => ({ ...current, [key]: value }))
  }, [])

  const applyPalette = useCallback((next: Palette, nextMode?: ThemeMode) => {
    setPalette(next)
    if (nextMode) setMode(nextMode)
  }, [])

  const switchMode = useCallback((next: ThemeMode) => {
    setMode(next)
    setPalette((current) => ({ ...current, ...deriveNeutrals(current.brand, next) }))
  }, [])

  const harmonize = useCallback(() => {
    setPalette((current) => ({
      ...current,
      accent: harmonizeAccent(current.brand, mode),
      ...deriveNeutrals(current.brand, mode),
    }))
  }, [mode])

  const randomize = useCallback(() => setPalette(randomPalette(mode)), [mode])

  const addMark = useCallback((next: Mark) => {
    setMarks((current) => {
      setMarkIndex(current.length)
      return [...current, next]
    })
  }, [])

  const removeMark = useCallback((id: string) => {
    setMarks((current) => {
      const index = current.findIndex((item) => item.id === id)
      if (index < 0) return current

      const next = current.filter((item) => item.id !== id)
      setMarkIndex((selected) => (selected >= index && selected > 0 ? selected - 1 : selected))
      return next
    })
  }, [])

  const setMarkMode = useCallback((id: string, next: MarkModeChoice) => {
    setMarks((current) =>
      current.map((item) => (item.id === id ? { ...item, mode: next } : item)),
    )
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
    markIndex,
    controls,
    saved,
    actions: {
      setColor,
      applyPalette,
      switchMode,
      harmonize,
      randomize,
      selectMark: setMarkIndex,
      addMark,
      removeMark,
      setMarkMode,
      updateControl,
      savePalette,
      removeSaved,
    },
  }
}

function loadSaved(): readonly SavedCombo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedCombo[]) : []
  } catch {
    // Storage cheio, desabilitado ou com dado de versão antiga: começar vazio é melhor do
    // que impedir a ferramenta de abrir.
    return []
  }
}
