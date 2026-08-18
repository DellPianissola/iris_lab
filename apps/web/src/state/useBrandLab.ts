import type { MarkMode } from '@nomai/svg-kit'
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
import { builtinMarks } from '../marks/load'
import type { Mark } from '../marks/types'
import { controlDefaults, STORAGE_KEY } from './config'
import { markById, selectionAfterRemoval } from './selection'

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
 *
 * O símbolo selecionado é identificado por **id**, não por posição: índice e lista são dois
 * estados que podem discordar, e mantê-los em acordo exigia acoplar os dois `setState`.
 */
export function useBrandLab() {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [palette, setPalette] = useState<Palette>(() => brandPalette('light'))
  const [marks, setMarks] = useState<readonly Mark[]>(builtinMarks)
  const [selectedId, setSelectedId] = useState(() => builtinMarks[0]?.id ?? '')
  const [controls, setControls] = useState<Controls>({ ...controlDefaults })
  const [saved, setSaved] = useState<readonly SavedCombo[]>(loadSaved)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Storage cheio ou desabilitado. Perder a persistência é aceitável; travar a
      // ferramenta por causa dela não é.
    }
  }, [saved])

  const tokens = useMemo(() => buildTokens(palette), [palette])
  const mark = useMemo(() => markById(marks, selectedId), [marks, selectedId])

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

  // Updater funcional porque o upload de vários arquivos chama isto em sequência, sem
  // re-render entre as chamadas. Selecionar por id não depende da lista, então os dois
  // `setState` ficam independentes.
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
    actions: {
      setColor,
      applyPalette,
      switchMode,
      harmonize,
      randomize,
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
