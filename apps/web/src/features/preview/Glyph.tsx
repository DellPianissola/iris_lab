import type { Mark } from '../../marks/types'

interface GlyphProps {
  readonly mark: Mark | undefined
}

/**
 * Desenha o símbolo no modo que o classificador escolheu. `theme` usa o markup com os tons
 * injetados; `original` usa o arquivo como veio. Bitmap com recorte vira máscara CSS.
 */
export function Glyph({ mark }: GlyphProps) {
  if (!mark) return null

  const followsTheme = mark.mode === 'theme'

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
