/**
 * Corpus de referência do `@nomai/svg-kit`. Os mesmos arquivos que a suíte usa — a bancada
 * lê deles em vez de manter cópia, senão os dois divergiriam no primeiro caso novo.
 */

const modules = import.meta.glob('../../../packages/svg-kit/fixtures/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface Sample {
  readonly name: string
  readonly markup: string
}

export const samples: readonly Sample[] = Object.entries(modules)
  .map(([path, markup]) => ({ name: path.split('/').pop() ?? path, markup }))
  .sort((a, b) => a.name.localeCompare(b.name))
