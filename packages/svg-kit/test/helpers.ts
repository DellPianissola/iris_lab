import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDomFromGlobals, type SvgDom } from '../src/index'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

export function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf8')
}

export function testDom(): SvgDom {
  return createDomFromGlobals()
}

/** Builds an RGBA buffer from blocks of `[r, g, b, a, count]`. */
export function pixels(...blocks: readonly [number, number, number, number, number][]): number[] {
  const data: number[] = []
  for (const [r, g, b, a, count] of blocks) {
    for (let i = 0; i < count; i += 1) data.push(r, g, b, a)
  }
  return data
}
