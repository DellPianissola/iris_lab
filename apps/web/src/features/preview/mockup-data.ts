/**
 * The fake site numbers. Kept as numbers rather than formatted text: `12.480` and `99,9%`
 * were hardcoded in pt-BR and would have looked wrong to anyone using the tool in English.
 */
export const mockupStats = {
  users: 12480,
  uptime: 0.999,
  rating: 4.8,
} as const

export const lockupBackdropIds = ['bg', 'surface', 'brand', 'mono'] as const
