// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Toolbar, type Tool } from '../src/components/Toolbar'
import { PlusIcon } from '../src/components/icons'
import { I18nProvider } from '../src/i18n'
import { LOCALE_STORAGE_KEY } from '../src/i18n/types'

let host: HTMLDivElement
let root: Root

const tools: readonly Tool[] = [
  { id: 'palette', label: 'Paleta', icon: PlusIcon, content: <input aria-label="hex" /> },
  { id: 'symbol', label: 'Símbolo', icon: PlusIcon, content: <p>conteúdo do símbolo</p> },
]

beforeEach(() => {
  localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR')
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => {
    root.render(
      <I18nProvider>
        <Toolbar tools={tools} />
      </I18nProvider>,
    )
  })
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

const tabs = () => [...host.querySelectorAll<HTMLButtonElement>('.tool-tab')]

/** `noUncheckedIndexedAccess` is on, and a missing tab should fail loudly, not as `undefined`. */
function tab(index: number): HTMLButtonElement {
  const found = tabs()[index]
  if (!found) throw new Error(`no tab at index ${index}`)
  return found
}
const drawer = () => host.querySelector('.drawer') as HTMLElement
const click = (element: Element) => {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}
const pressEscape = () => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  })
}

describe('Toolbar', () => {
  // The closed state is the default, so it is the one that would ship an `aria-controls`
  // pointing at nothing — the same ARIA violation the help disclosure had.
  it('keeps the drawer in the DOM while closed, so every tab resolves its target', () => {
    expect(drawer().hasAttribute('hidden')).toBe(true)

    for (const each of tabs()) {
      expect(each.getAttribute('aria-expanded')).toBe('false')
      expect(document.getElementById(each.getAttribute('aria-controls') ?? '')).toBe(drawer())
    }
  })

  it('opens the clicked tool and labels the drawer with it', () => {
    click(tab(1))

    expect(tab(1).getAttribute('aria-expanded')).toBe('true')
    expect(drawer().hasAttribute('hidden')).toBe(false)
    expect(drawer().getAttribute('aria-label')).toBe('Símbolo')
    expect(drawer().textContent).toContain('conteúdo do símbolo')
  })

  it('closes on a second click of the same tab', () => {
    click(tab(0))
    click(tab(0))

    expect(tab(0).getAttribute('aria-expanded')).toBe('false')
    expect(drawer().hasAttribute('hidden')).toBe(true)
  })

  // A bar with two panels open at once is a sidebar lying down, and it would eat the preview
  // the bar exists to protect.
  it('never leaves two tools open', () => {
    click(tab(0))
    click(tab(1))

    expect(tabs().map((each) => each.getAttribute('aria-expanded'))).toEqual(['false', 'true'])
    expect(drawer().querySelector('input[aria-label="hex"]')).toBeNull()
    expect(drawer().textContent).toContain('conteúdo do símbolo')
  })

  /**
   * The drawer fades and slides on the way out. Clearing the content on the closing click
   * would animate an empty box down, which is worse than not animating at all.
   */
  it('keeps the last panel mounted while it animates out', () => {
    click(tab(1))
    click(tab(1))

    expect(drawer().hasAttribute('hidden')).toBe(true)
    expect(drawer().querySelector('h2')?.textContent).toBe('Símbolo')
    expect(drawer().textContent).toContain('conteúdo do símbolo')
  })

  it('has no empty heading before anything has been opened', () => {
    expect(drawer().querySelector('h2')).toBeNull()
    expect(drawer().getAttribute('aria-label')).toBe('Ferramentas')
  })

  it('closes on Escape', () => {
    click(tab(0))
    pressEscape()

    expect(drawer().hasAttribute('hidden')).toBe(true)
  })

  /**
   * The drawer content unmounts on close, so focus sitting inside it lands on `<body>` and the
   * next Tab restarts from the top of the document (WCAG 2.4.3). It has to go back to the tab
   * that opened the drawer.
   */
  it('returns focus to the tab when Escape closes it from inside', () => {
    click(tab(0))
    const inside = drawer().querySelector('input') as HTMLInputElement
    inside.focus()
    expect(document.activeElement).toBe(inside)

    pressEscape()

    expect(document.activeElement).toBe(tab(0))
  })

  it('returns focus to the tab when the close button is used', () => {
    click(tab(1))
    click(host.querySelector('.drawer-close') as Element)

    expect(document.activeElement).toBe(tab(1))
  })
})
