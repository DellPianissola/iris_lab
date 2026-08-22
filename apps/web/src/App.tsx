import { buildChrome, chromeToCssVars, fontStack, tokensToCssVars } from '@nomai/theme'
import { useCallback, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { StageControls } from './components/StageControls'
import { Toolbar, type Tool } from './components/Toolbar'
import { Watermark } from './components/Watermark'
import {
  ContrastIcon,
  PaletteIcon,
  PresetsIcon,
  SavedIcon,
  SymbolIcon,
  TypeIcon,
} from './components/icons'
import { useI18n } from './i18n'
import { ContrastBadge } from './features/contrast/ContrastBadge'
import { ContrastPanel } from './features/contrast/ContrastPanel'
import { PalettePanel } from './features/palette/PalettePanel'
import { PresetGrid } from './features/palette/PresetGrid'
import { BrandSheet } from './features/preview/BrandSheet'
import { SiteMockup } from './features/preview/SiteMockup'
import { SavedPanel } from './features/saved/SavedPanel'
import { SymbolPanel } from './features/symbol/SymbolPanel'
import { TypePanel } from './features/typography/TypePanel'
import { lockupScale } from './state/config'
import { useBrandLab } from './state/useBrandLab'
import { useKeyboardShortcut, useUndoShortcut } from './state/useShortcuts'

const RANDOMIZE_KEY = 'r'

export function App() {
  const { mode, palette, tokens, marks, mark, selectedId, controls, saved, canUndo, canRedo, actions } =
    useBrandLab()
  const { t } = useI18n()

  /**
   * One surface at a time, across both of them: the toolbar drawer rising from the bottom and
   * the brand sheet dropping from the header. Held here rather than inside each, because with
   * the state split the two opened together and squeezed the preview between them — the thing
   * "one drawer at a time" existed to prevent, just on the other axis.
   */
  const brandSheetId = useId()
  const aboutId = useId()
  const [openSurface, setOpenSurface] = useState<string | null>(null)
  const brandButton = useRef<HTMLButtonElement | null>(null)
  const brandSheetOpen = openSurface === brandSheetId

  // Memoised because `BrandSheet` hangs its Escape and outside-pointer listeners off it: an
  // arrow rebuilt each render re-subscribes both on every repaint the palette causes.
  const closeBrandSheet = useCallback(() => setOpenSurface(null), [])

  const closeAbout = useCallback(() => setOpenSurface(null), [])

  function toggleBrandSheet(): void {
    if (brandSheetOpen) {
      brandButton.current?.focus()
      setOpenSurface(null)
    } else {
      setOpenSurface(brandSheetId)
    }
  }

  useKeyboardShortcut(RANDOMIZE_KEY, actions.randomize)
  useUndoShortcut(actions.undo, actions.redo)

  /**
   * The tool wears what the customer just picked. Every foreground here has been through the
   * contrast search, so a palette that fails in the mockup still leaves the toolbar readable;
   * the static `--ui-*` in the stylesheet are the pre-hydration paint.
   *
   * Memoised apart from the rest because it depends only on the palette, and thirteen contrast
   * searches are not worth repeating every time a slider moves.
   */
  const chromeStyle = useMemo(() => chromeToCssVars(buildChrome(palette)), [palette])

  /** One node carries every token, so changing a colour repaints instead of re-rendering. */
  const previewStyle = useMemo(() => {
    const plated = controls.plate
    return {
      ...tokensToCssVars(tokens),
      ...chromeStyle,
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
  }, [tokens, chromeStyle, controls, mark])

  const glyphColor = controls.plate ? tokens.onBrand : tokens.brandInk

  const tools: readonly Tool[] = [
    {
      id: 'palette',
      label: t.palette.title,
      icon: PaletteIcon,
      content: (
        <PalettePanel
          palette={palette}
          onColorChange={actions.setColor}
          onRandomize={actions.randomize}
          onHarmonize={actions.harmonize}
          onInvert={() => actions.switchMode(mode === 'dark' ? 'light' : 'dark')}
          onUndo={actions.undo}
          onRedo={actions.redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      ),
    },
    {
      id: 'presets',
      label: t.presets.title,
      icon: PresetsIcon,
      content: <PresetGrid onPick={actions.applyPalette} />,
    },
    {
      id: 'symbol',
      label: t.symbol.title,
      icon: SymbolIcon,
      content: (
        <SymbolPanel
          marks={marks}
          mark={mark}
          selectedId={selectedId}
          controls={controls}
          onSelect={actions.selectMark}
          onAdd={actions.addMark}
          onRemove={actions.removeMark}
          onModeChange={actions.setMarkMode}
          onControlChange={actions.updateControl}
        />
      ),
    },
    {
      id: 'typography',
      label: t.typography.title,
      icon: TypeIcon,
      content: <TypePanel controls={controls} onChange={actions.updateControl} />,
    },
    {
      id: 'contrast',
      label: t.contrast.title,
      icon: ContrastIcon,
      badge: <ContrastBadge tokens={tokens} />,
      content: <ContrastPanel tokens={tokens} />,
    },
    {
      id: 'saved',
      label: t.saved.title,
      icon: SavedIcon,
      content: (
        <SavedPanel
          palette={palette}
          saved={saved}
          onSave={actions.savePalette}
          onRemove={actions.removeSaved}
          onApply={actions.applyPalette}
        />
      ),
    },
  ]

  return (
    // The theme custom properties ride on the shell so both the stage and the brand sheet read
    // them from one node; nothing below recomputes colour.
    <div className="app" data-outlines={controls.outlines ? 'on' : 'off'} style={previewStyle}>
      <StageControls
        mode={mode}
        onModeChange={actions.switchMode}
        brandSheetId={brandSheetId}
        brandSheetOpen={brandSheetOpen}
        onBrandSheetToggle={toggleBrandSheet}
        brandButtonRef={brandButton}
      />

      <BrandSheet
        id={brandSheetId}
        open={brandSheetOpen}
        onClose={closeBrandSheet}
        triggerRef={brandButton}
        tokens={tokens}
        mark={mark}
        controls={controls}
        glyphColor={glyphColor}
      />

      {/* No card, no caption, no siblings: the stage **is** the fake landing page. Wrapping it
          in chrome was what gave it away as a widget in a gallery, and the customer is here to
          judge whether it reads as a site. */}
      <main className="stage">
        <div className="canvas">
          <SiteMockup tokens={tokens} mark={mark} controls={controls} />
        </div>
      </main>

      <Toolbar tools={tools} openId={openSurface} onOpenChange={setOpenSurface}>
        <Watermark
          id={aboutId}
          open={openSurface === aboutId}
          onToggle={() => setOpenSurface((current) => (current === aboutId ? null : aboutId))}
          onClose={closeAbout}
        />
      </Toolbar>
    </div>
  )
}
