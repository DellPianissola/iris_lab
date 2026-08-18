import { describe, expect, it } from 'vitest'
import { extractColorRules, specificityOf } from '../../src/index'

describe('extractColorRules', () => {
  it('extrai fill e stroke, ignorando o resto', () => {
    const rules = extractColorRules('.st0{fill:#231F20;stroke:red;opacity:.5}')

    expect(rules).toHaveLength(1)
    expect(rules[0]?.declarations).toEqual([
      { prop: 'fill', value: '#231F20', important: false },
      { prop: 'stroke', value: 'red', important: false },
    ])
  })

  it('separa lista de seletores em regras independentes', () => {
    const rules = extractColorRules('.a, .b { fill: red }')

    expect(rules.map((r) => r.selector)).toEqual(['.a', '.b'])
  })

  it('marca !important', () => {
    const rules = extractColorRules('.st0{fill:#000 !important}')

    expect(rules[0]?.declarations[0]?.important).toBe(true)
    expect(rules[0]?.declarations[0]?.value).toBe('#000')
  })

  it('descarta comentários', () => {
    const rules = extractColorRules('/* .fake{fill:red} */ .st0{fill:blue}')

    expect(rules).toHaveLength(1)
    expect(rules[0]?.selector).toBe('.st0')
  })

  // O regex do protótipo (`[^{}]+\{[^{}]*\}`) se perdia aqui e corrompia tudo que vinha
  // depois do bloco aninhado.
  it('pula bloco de at-rule sem desalinhar a regra seguinte', () => {
    const css = '@media (min-width:10px){ .dentro{fill:red} } .depois{fill:blue}'
    const rules = extractColorRules(css)

    expect(rules.map((r) => r.selector)).toEqual(['.depois'])
  })

  it('não confunde at-rule sem bloco com seletor', () => {
    const css = '@import url(https://x.example/a.css); .st0{fill:blue}'
    const rules = extractColorRules(css)

    expect(rules.map((r) => r.selector)).toEqual(['.st0'])
  })

  it('numera as regras em ordem de documento', () => {
    const rules = extractColorRules('.a{fill:red}.b{fill:blue}')

    expect(rules.map((r) => r.order)).toEqual([0, 1])
  })
})

describe('specificityOf', () => {
  it('ordena id acima de classe acima de tipo', () => {
    expect(specificityOf('#logo')).toBeGreaterThan(specificityOf('.st0'))
    expect(specificityOf('.st0')).toBeGreaterThan(specificityOf('path'))
  })

  it('soma classes do mesmo composto', () => {
    expect(specificityOf('.a.b')).toBeGreaterThan(specificityOf('.a'))
  })

  it('conta o tipo junto da classe', () => {
    expect(specificityOf('path.st0')).toBeGreaterThan(specificityOf('.st0'))
  })
})
