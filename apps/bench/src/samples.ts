/**
 * The `@nomai/svg-kit` reference corpus. The same files the suite uses — the bench reads
 * them instead of keeping a copy, or the two would diverge on the first new case.
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
