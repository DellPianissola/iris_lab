// @vitest-environment happy-dom
import { brandPalette, buildTokens } from '@nomai/theme'
import { act, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BrandSheet } from '../src/features/preview/BrandSheet'
import { I18nProvider } from '../src/i18n'
import { ptBR } from '../src/i18n/locales/pt-BR'
import { LOCALE_STORAGE_KEY } from '../src/i18n/types'
import { controlDefaults } from '../src/state/config'

let host: HTMLDivElement
let root: Root

const tokens = buildTokens(brandPalette('light'))

/** The trigger and the sheet wired the way the app wires them, which is what is under test. */
function Host() {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <button
        type="button"
        ref={trigger}
        aria-expanded={open}
        aria-controls="brand-sheet"
        onClick={() => setOpen((current) => !current)}
      >
        {ptBR.brand.title}
      </button>
      <BrandSheet
        id="brand-sheet"
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={trigger}
        tokens={tokens}
        mark={undefined}
        controls={controlDefaults}
        glyphColor={tokens.brandInk}
      />
    </>
  )
}

beforeEach(() => {
  localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR')
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => {
    root.render(
      <I18nProvider>
        <Host />
      </I18nProvider>,
    )
  })
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

const trigger = () => host.querySelector('button') as HTMLButtonElement
const sheet = () => host.querySelector('.brand-sheet') as HTMLElement
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

describe('BrandSheet', () => {
  // The closed state is the default, so it is the one that would ship an `aria-controls`
  // pointing at nothing.
  it('stays in the DOM while closed, so aria-controls resolves', () => {
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(sheet().hasAttribute('hidden')).toBe(true)
    expect(document.getElementById(trigger().getAttribute('aria-controls') ?? '')).toBe(sheet())
  })

  it('opens with both sections and a name of its own', () => {
    click(trigger())

    expect(sheet().hasAttribute('hidden')).toBe(false)
    expect(sheet().getAttribute('role')).toBe('region')
    expect(sheet().getAttribute('aria-label')).toBe(ptBR.brand.title)
    expect([...sheet().querySelectorAll('.sheet-cap')].map((h) => h.textContent)).toEqual([
      ptBR.brand.lockups,
      ptBR.brand.favicon,
    ])
  })

  it('shows the mark on the four grounds it will land on', () => {
    click(trigger())

    expect(sheet().querySelectorAll('.lockup-cell')).toHaveLength(4)
    expect(sheet().querySelectorAll('.favicon').length).toBeGreaterThan(0)
  })

  /**
   * The sheet fades and slides on the way out, and its content unmounts nowhere: focus sitting
   * inside it would land on `<body>` and the next Tab would restart from the top of the
   * document (WCAG 2.4.3).
   */
  it('hands focus back to the trigger when Escape closes it', () => {
    click(trigger())
    const inside = sheet().querySelector('button') as HTMLButtonElement
    inside.focus()
    expect(document.activeElement).toBe(inside)

    pressEscape()

    expect(sheet().hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(trigger())
  })

  it('hands focus back when the close button is used', () => {
    click(trigger())
    click(sheet().querySelector('.sheet-close') as Element)

    expect(sheet().hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(trigger())
  })

  it('ignores Escape while it is already closed', () => {
    pressEscape()

    expect(sheet().hasAttribute('hidden')).toBe(true)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })
})
