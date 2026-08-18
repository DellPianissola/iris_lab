import { brandPalette } from '@nomai/theme'

/** Padrões da bancada. As cores vêm de `@nomai/theme` — nenhum literal aqui. */
const palette = brandPalette('light')

export const toneDefaults = {
  tone0: palette.brand,
  tone1: palette.accent,
} as const

export const backdrops = [
  { id: 'light', label: 'Claro', background: palette.bg },
  { id: 'dark', label: 'Escuro', background: brandPalette('dark').bg },
  { id: 'brand', label: 'Sobre a marca', background: palette.brand },
] as const

export type BackdropId = (typeof backdrops)[number]['id']

/** Rótulos do relatório. O classificador decide; a bancada só mostra a conclusão. */
export const kindLabels: Readonly<Record<string, string>> = {
  mono: 'Uma cor só',
  duo: 'Duas cores',
  multi: 'Colorido',
  raster: 'Bitmap embutido',
  'raster-opaque': 'Bitmap sem transparência',
}

export const warningLabels: Readonly<Record<string, string>> = {
  'embedded-raster': 'Tem imagem rasterizada embutida — é um PNG dentro de um SVG.',
  gradient: 'Tem gradiente — as partes com gradiente ficam como estão.',
  'missing-viewbox': 'Sem viewBox: o desenho pode não escalar direito.',
  'opaque-raster': 'Fundo sólido: colorir viraria um retângulo.',
}

export const modeLabels: Readonly<Record<string, string>> = {
  theme: 'Segue o tema do site',
  original: 'Mantém as cores do logo',
}
