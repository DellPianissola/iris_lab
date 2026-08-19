import { describe, expect, it } from 'vitest'
import { extractColorRules, specificityOf } from '../../src/index'

describe('extractColorRules', () => {
  it('extracts fill and stroke, ignoring the rest', () => {
    const rules = extractColorRules('.st0{fill:#231F20;stroke:red;opacity:.5}')

    expect(rules).toHaveLength(1)
    expect(rules[0]?.declarations).toEqual([
      { prop: 'fill', value: '#231F20', important: false },
      { prop: 'stroke', value: 'red', important: false },
    ])
  })

  it('splits a selector list into independent rules', () => {
    const rules = extractColorRules('.a, .b { fill: red }')

    expect(rules.map((r) => r.selector)).toEqual(['.a', '.b'])
  })

  it('flags !important', () => {
    const rules = extractColorRules('.st0{fill:#000 !important}')

    expect(rules[0]?.declarations[0]?.important).toBe(true)
    expect(rules[0]?.declarations[0]?.value).toBe('#000')
  })

  it('discards comments', () => {
    const rules = extractColorRules('/* .fake{fill:red} */ .st0{fill:blue}')

    expect(rules).toHaveLength(1)
    expect(rules[0]?.selector).toBe('.st0')
  })

  // The prototype's regex (`[^{}]+\{[^{}]*\}`) lost its place here and corrupted everything
  // after the nested block.
  it('skips an at-rule block without derailing the next rule', () => {
    const css = '@media (min-width:10px){ .dentro{fill:red} } .depois{fill:blue}'
    const rules = extractColorRules(css)

    expect(rules.map((r) => r.selector)).toEqual(['.depois'])
  })

  it('does not mistake a block-less at-rule for a selector', () => {
    const css = '@import url(https://x.example/a.css); .st0{fill:blue}'
    const rules = extractColorRules(css)

    expect(rules.map((r) => r.selector)).toEqual(['.st0'])
  })

  it('numbers the rules in document order', () => {
    const rules = extractColorRules('.a{fill:red}.b{fill:blue}')

    expect(rules.map((r) => r.order)).toEqual([0, 1])
  })
})

describe('specificityOf', () => {
  it('ranks id above class above type', () => {
    expect(specificityOf('#logo')).toBeGreaterThan(specificityOf('.st0'))
    expect(specificityOf('.st0')).toBeGreaterThan(specificityOf('path'))
  })

  it('sums classes within one compound', () => {
    expect(specificityOf('.a.b')).toBeGreaterThan(specificityOf('.a'))
  })

  it('counts the type alongside the class', () => {
    expect(specificityOf('path.st0')).toBeGreaterThan(specificityOf('.st0'))
  })
})
