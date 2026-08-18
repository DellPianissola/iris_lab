/**
 * Os números do site falso. Ficam como número, não como texto formatado: `12.480` e `99,9%`
 * estavam chumbados em pt-BR e apareceriam errados para quem usa a ferramenta em inglês.
 */
export const mockupStats = {
  users: 12480,
  uptime: 0.999,
  rating: 4.8,
} as const

export const lockupBackdropIds = ['bg', 'surface', 'brand', 'mono'] as const
