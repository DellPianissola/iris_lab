// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Help } from '../src/components/Section'
import { I18nProvider } from '../src/i18n'
import { ptBR } from '../src/i18n/locales/pt-BR'
import { LOCALE_STORAGE_KEY } from '../src/i18n/types'

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  // Without this the provider reads `navigator.languages`, which under happy-dom is en-US —
  // the assertion on the accessible name would then depend on the test runner's locale.
  localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR')
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

function mount(label: string, body: string) {
  act(() => {
    root.render(
      <I18nProvider>
        <Help label={label}>{body}</Help>
      </I18nProvider>,
    )
  })

  const toggle = host.querySelector('button')
  if (!toggle) throw new Error('Help rendered no toggle')
  return toggle
}

const target = (toggle: Element) =>
  document.getElementById(toggle.getAttribute('aria-controls') ?? '')

describe('Help', () => {
  // The closed state is the default, so it is the one that would ship an `aria-controls`
  // pointing at nothing — an ARIA violation an audit catches before a user does.
  it('keeps the paragraph in the DOM while closed, so aria-controls resolves', () => {
    const toggle = mount('Copiar link', 'O link carrega a paleta.')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(target(toggle)).not.toBeNull()
    expect(target(toggle)?.hasAttribute('hidden')).toBe(true)
  })

  it('reveals the paragraph and flips aria-expanded on click', () => {
    const toggle = mount('Copiar link', 'O link carrega a paleta.')

    act(() => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(target(toggle)?.hasAttribute('hidden')).toBe(false)
    expect(target(toggle)?.textContent).toBe('O link carrega a paleta.')
  })

  it('closes again on a second click', () => {
    const toggle = mount('Copiar link', 'O link carrega a paleta.')

    for (const _ of [0, 1]) {
      act(() => {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
    }

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(target(toggle)?.hasAttribute('hidden')).toBe(true)
  })

  // The icon carries no text, so the accessible name has to come from the dictionary — and
  // it is the only place a locale change can silently drop it.
  it('names the button from the dictionary, not from the icon', () => {
    const toggle = mount('Símbolo', 'Ao subir um arquivo, ele é analisado.')

    expect(toggle.getAttribute('aria-label')).toBe(ptBR.app.help('Símbolo'))
    expect(toggle.textContent).toBe('')
  })

  it('gives each instance its own paragraph id', () => {
    act(() => {
      root.render(
        <I18nProvider>
          <Help label="A">primeiro</Help>
          <Help label="B">segundo</Help>
        </I18nProvider>,
      )
    })

    const ids = [...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-controls'))

    expect(new Set(ids).size).toBe(2)
  })
})
