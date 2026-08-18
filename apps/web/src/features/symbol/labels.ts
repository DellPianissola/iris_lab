import type { MarkKind, MarkMode, WarningCode } from '@nomai/svg-kit'

/** O que o cliente lê no relatório. O classificador decide; isto só traduz a conclusão. */

export const kindReport: Readonly<Record<MarkKind, { title: string; body: string }>> = {
  mono: {
    title: 'Logo de uma cor só',
    body: 'Pode assumir a cor do site com segurança.',
  },
  duo: {
    title: 'Logo de duas cores',
    body: 'A cor dominante vira a principal; a segunda vira o acento.',
  },
  multi: {
    title: 'Logo colorido',
    body: 'Recolorir descaracterizaria a marca — mantivemos as cores originais.',
  },
  raster: {
    title: 'Imagem embutida',
    body: 'É um bitmap dentro de um SVG: as cores não estão no desenho.',
  },
  'raster-opaque': {
    title: 'Imagem sem transparência',
    body: 'O fundo é sólido, então só dá pra usar como está.',
  },
}

export const warningText: Readonly<Record<WarningCode, string>> = {
  'embedded-raster': 'Tem imagem rasterizada embutida — é um PNG dentro de um SVG, não dá pra recolorir.',
  gradient: 'Tem gradiente — as partes com gradiente ficam como estão.',
  'missing-viewbox': 'Sem viewBox: o desenho pode não escalar direito.',
  'opaque-raster':
    'Sem fundo transparente: colorir viraria um retângulo sólido. Exporte com fundo transparente pra poder trocar a cor.',
}

export const modeOptions: readonly { id: MarkMode; label: string }[] = [
  { id: 'theme', label: 'Seguir o tema do site' },
  { id: 'original', label: 'Usar as cores do logo' },
]

/** Bitmap opaco não tem como seguir o tema: colorir viraria um retângulo. */
export const LOCKED_KIND: MarkKind = 'raster-opaque'
