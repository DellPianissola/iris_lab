import { fontStack, tokensToCssVars } from '@nomai/theme'
import { useEffect, useMemo, type CSSProperties } from 'react'
import { Segmented } from './components/Field'
import { ContrastPanel } from './features/contrast/ContrastPanel'
import { PalettePanel } from './features/palette/PalettePanel'
import { PresetGrid } from './features/palette/PresetGrid'
import { FaviconPreview } from './features/preview/FaviconPreview'
import { LockupGrid } from './features/preview/LockupGrid'
import { SiteMockup } from './features/preview/SiteMockup'
import { SavedPanel } from './features/saved/SavedPanel'
import { SymbolPanel } from './features/symbol/SymbolPanel'
import { TypePanel } from './features/typography/TypePanel'
import { lockupScale } from './state/config'
import { useBrandLab } from './state/useBrandLab'

const MODE_OPTIONS = [
  { id: 'light' as const, label: '☀︎ Claro' },
  { id: 'dark' as const, label: '☾ Escuro' },
]

export function App() {
  const { mode, palette, tokens, marks, mark, markIndex, controls, saved, actions } = useBrandLab()

  useKeyboardShortcut('r', actions.randomize)

  // Os tokens viram custom properties num nó só; nada abaixo recalcula cor.
  const previewStyle = useMemo(() => {
    const plated = controls.plate
    return {
      ...tokensToCssVars(tokens),
      '--f-display': fontStack(controls.displayFont),
      '--f-body': fontStack(controls.bodyFont),
      '--word-track': `${controls.tracking / 100}em`,
      '--btn-radius': `${controls.buttonRadius}px`,
      '--mark-size': `${controls.markSize}px`,
      '--mark-aspect': String(mark?.aspect ?? 1),
      '--mark-radius': plated ? `${(controls.markRadius / 100) * controls.markSize}px` : '0px',
      '--mark-plate': plated ? tokens.brand : 'transparent',
      '--mark-pad': plated ? `${Math.round(controls.markSize * lockupScale.platePadding)}px` : '0px',
      '--glyph-color': plated ? tokens.onBrand : tokens.brandInk,
      '--tone-0': plated ? tokens.onBrand : tokens.brandInk,
      '--tone-1': tokens.accent,
    } as CSSProperties
  }, [tokens, controls, mark])

  const glyphColor = controls.plate ? tokens.onBrand : tokens.brandInk

  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <h1>Íris</h1>
          <p>
            Suba seu logo, troque as cores e veja tudo aplicado num site de verdade. Nada é
            enviado pra lugar nenhum — roda 100% no seu navegador.
          </p>
        </header>

        <PalettePanel
          palette={palette}
          onColorChange={actions.setColor}
          onRandomize={actions.randomize}
          onHarmonize={actions.harmonize}
          onInvert={() => actions.switchMode(mode === 'dark' ? 'light' : 'dark')}
        />

        <PresetGrid onPick={actions.applyPalette} />

        <SymbolPanel
          marks={marks}
          mark={mark}
          markIndex={markIndex}
          controls={controls}
          onSelect={actions.selectMark}
          onAdd={actions.addMark}
          onRemove={actions.removeMark}
          onModeChange={actions.setMarkMode}
          onControlChange={actions.updateControl}
        />

        <TypePanel controls={controls} onChange={actions.updateControl} />
        <ContrastPanel tokens={tokens} />
        <SavedPanel
          palette={palette}
          saved={saved}
          onSave={actions.savePalette}
          onRemove={actions.removeSaved}
          onApply={actions.applyPalette}
        />
      </aside>

      <main className="stage">
        <div className="stage-bar">
          <Segmented value={mode} options={MODE_OPTIONS} onChange={actions.switchMode} />
          <span className="spacer" />
          <span className="hint">
            Dica: aperte <code>R</code> pra sortear uma paleta
          </span>
        </div>

        <section className="card" style={previewStyle}>
          <h2 className="card-cap">Logo em contexto</h2>
          <LockupGrid tokens={tokens} mark={mark} controls={controls} glyphColor={glyphColor} />
        </section>

        <section className="card" style={previewStyle}>
          <h2 className="card-cap">Site</h2>
          <SiteMockup tokens={tokens} mark={mark} controls={controls} />
        </section>

        <section className="card" style={previewStyle}>
          <h2 className="card-cap">Favicon / ícone de app</h2>
          <FaviconPreview
            tokens={tokens}
            mark={mark}
            wordmark={controls.wordmark}
            plate={controls.plate}
          />
        </section>
      </main>
    </div>
  )
}

/** Atalho global, ignorado enquanto o foco está num campo. */
function useKeyboardShortcut(key: string, action: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() !== key) return

      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return

      action()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, action])
}
