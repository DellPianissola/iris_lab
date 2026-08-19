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

/** O par que o desfazer e o link compartilhado governam juntos. */
interface Look {
  readonly palette: Palette
  readonly mode: ThemeMode
}

/**
 * Todo o estado da ferramenta num lugar só. Os componentes recebem valores e ações —
 * nenhum deles guarda estado próprio nem calcula token.
 *
 * O símbolo selecionado é identificado por **id**, não por posição: índice e lista são dois
 * estados que podem discordar, e mantê-los em acordo exigia acoplar os dois `setState`.
 */
export function useBrandLab() {
  const [look, setLook] = useState<History<Look>>(() => initHistory(initialLook()))
  const [marks, setMarks] = useState<readonly Mark[]>(builtinMarks)
  const [selectedId, setSelectedId] = useState(() => builtinMarks[0]?.id ?? '')
  const [controls, setControls] = useState<Controls>({ ...controlDefaults })
  const [saved, setSaved] = useState<readonly SavedCombo[]>(loadSaved)

  const { palette, mode } = look.present

  useEffect(() => {
    // `replaceState` em vez de `location.hash`: atribuir ao hash empilha uma entrada de
    // histórico por mudança de cor, e o botão Voltar do navegador deixaria de servir.
    const next = `${location.pathname}${location.search}#${encodeShare(palette, mode)}`
    history.replaceState(null, '', next)
  }, [palette, mode])

  useEffect(() => {
    // Colar um link compartilhado na barra de endereço troca só o hash, e isso **não**
    // recarrega a página: sem escutar `hashchange`, o link chegava e o efeito acima o
    // sobrescrevia no instante seguinte. `replaceState` não dispara este evento, então só
    // navegação de gente cai aqui.
    function onHashChange(): void {
      const shared = decodeShare(location.hash)
      // Numa constante local: o estreitamento do type guard não atravessa a closure abaixo.
      const sharedPalette = shared.palette
      if (!isCompletePalette(sharedPalette)) return

      setLook((current) => {
        const next = { palette: sharedPalette, mode: shared.mode ?? current.present.mode }
        // Comparar pelo próprio serializador em vez de token a token: continua correto se
        // a paleta ganhar um token novo.
        const igual =
          encodeShare(next.palette, next.mode) ===
          encodeShare(current.present.palette, current.present.mode)

        // Gravar como passo permite desfazer a chegada do link, em vez de perder o que
        // estava na tela.
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
      // Storage cheio ou desabilitado. Perder a persistência é aceitável; travar a
      // ferramenta por causa dela não é.
    }
  }, [saved])

  const tokens = useMemo(() => buildTokens(palette), [palette])
  const mark = useMemo(() => markById(marks, selectedId), [marks, selectedId])

  const setColor = useCallback((key: PaletteKey, value: string) => {
    setLook((current) =>
      record(
        current,
        { ...current.present, palette: { ...current.present.palette, [key]: value } },
        // A chave é o token: o arrasto inteiro num seletor vira um passo, mas ajustar
        // acento e depois bordas continua sendo dois passos desfazíveis.
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

/** Link compartilhado manda; sem ele, a paleta da casa. */
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
    // Storage cheio, desabilitado ou com dado de versão antiga: começar vazio é melhor do
    // que impedir a ferramenta de abrir.
    return []
  }
}
