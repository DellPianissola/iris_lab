import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react'
import { ChevronUpIcon, CloseIcon } from './icons'
import { useI18n } from '../i18n'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export interface Tool {
  readonly id: string
  readonly label: string
  readonly icon: IconComponent
  readonly content: ReactNode
  /** Rendered inside the tab itself — a reading the person needs without opening anything. */
  readonly badge?: ReactNode
}

interface ToolbarProps {
  readonly tools: readonly Tool[]
}

/**
 * The controls live at the bottom and the drawer grows **upward** on purpose. Expanding
 * downward from a header would cover the mockup's own header and hero — the exact area where
 * the brand colour shows — so the person would be dragging a colour with the thing it changes
 * hidden behind the panel. Growing up costs the footer and the favicon strip instead.
 *
 * One drawer, one open tool: a bar with several panels open at once is a sidebar lying down,
 * and it would eat the preview it exists to protect.
 */
export function Toolbar({ tools }: ToolbarProps) {
  const { t } = useI18n()
  const [openId, setOpenId] = useState<string | null>(null)
  /**
   * What the drawer holds, which outlives what is open. Clearing the content on the closing
   * click would slide an empty box down for the length of the exit transition; `shownId` keeps
   * the last panel mounted until another one replaces it. `hidden` is what keeps it away from
   * assistive tech, so nothing leaks by staying mounted.
   */
  const [shownId, setShownId] = useState<string | null>(null)
  const drawerId = useId()
  const tabs = useRef(new Map<string, HTMLButtonElement>())
  const open = tools.find((tool) => tool.id === openId) ?? null
  const shown = tools.find((tool) => tool.id === shownId) ?? null
  const isOpen = open !== null

  /**
   * Closing has to hand the focus back to the tab that opened the drawer, or focus sitting
   * inside it lands on `<body>` and the next Tab restarts from the top of the document
   * (WCAG 2.4.3). The focus call stays **outside** the state updater: an updater has to be
   * pure, and StrictMode invokes it twice to prove it.
   */
  const close = useCallback(() => {
    if (openId) tabs.current.get(openId)?.focus()
    setOpenId(null)
  }, [openId])

  function toggle(id: string): void {
    if (id === openId) {
      close()
      return
    }
    setOpenId(id)
    setShownId(id)
  }

  // Keyed on whether anything is open, not on the tool object: `tools` is rebuilt every
  // render, so depending on the object would re-subscribe on every colour the picker emits.
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  return (
    <div className="toolbar">
      {/* Always rendered, `hidden` while closed: every tab points its `aria-controls` here. */}
      <div
        className="drawer"
        id={drawerId}
        hidden={!isOpen}
        role="region"
        aria-label={shown?.label ?? t.app.tools}
      >
        {shown && (
          <>
            <div className="drawer-head">
              <h2>{shown.label}</h2>
              <button
                type="button"
                className="icon-button drawer-close"
                aria-label={t.app.closeTool}
                onClick={close}
              >
                <CloseIcon className="icon" aria-hidden="true" />
              </button>
            </div>
            <div className="drawer-body">{shown.content}</div>
          </>
        )}
      </div>

      <nav className="toolbar-bar" aria-label={t.app.tools}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="tool-tab"
            ref={(node) => {
              if (node) tabs.current.set(tool.id, node)
              else tabs.current.delete(tool.id)
            }}
            aria-expanded={tool.id === openId}
            aria-controls={drawerId}
            onClick={() => toggle(tool.id)}
          >
            <tool.icon className="icon" aria-hidden="true" />
            <span className="tool-label">{tool.label}</span>
            {tool.badge}
            <ChevronUpIcon className="tool-caret" aria-hidden="true" />
          </button>
        ))}
      </nav>
    </div>
  )
}
