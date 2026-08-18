import type { Mark } from '../../marks/types'

interface GlyphProps {
  readonly mark: Mark | undefined
  /** Mostra o arquivo como ele veio, ignorando o modo — usado na grade de escolha. */
  readonly forceOriginal?: boolean
}

/**
 * Bitmap não tem como receber tom injetado, então no modo `theme` ele vira silhueta por
 * máscara CSS — o que só funciona porque o classificador já garantiu que há recorte.
 */
export function Glyph({ mark, forceOriginal = false }: GlyphProps) {
  if (!mark) return null

  const followsTheme = !forceOriginal && mark.mode === 'theme'

  if (mark.type === 'svg') {
    return (
      <span
        className="glyph-art"
        // O markup já passou pelo sanitizador do pipeline antes de chegar aqui.
        dangerouslySetInnerHTML={{ __html: followsTheme ? mark.themed : mark.original }}
      />
    )
  }

  if (followsTheme) {
    return (
      <span
        className="glyph-art glyph-masked"
        style={{ maskImage: `url(${mark.url})`, WebkitMaskImage: `url(${mark.url})` }}
      />
    )
  }

  return <img className="glyph-art" src={mark.url} alt="" />
}
