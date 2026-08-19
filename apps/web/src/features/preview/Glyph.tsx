import type { Mark } from '../../marks/types'

interface GlyphProps {
  readonly mark: Mark | undefined
  /** Shows the file as it arrived, ignoring the mode — used in the picker grid. */
  readonly forceOriginal?: boolean
}

/**
 * A bitmap cannot take an injected tone, so in `theme` mode it becomes a silhouette through
 * a CSS mask — which only works because the classifier already guaranteed a cut-out.
 */
export function Glyph({ mark, forceOriginal = false }: GlyphProps) {
  if (!mark) return null

  const followsTheme = !forceOriginal && mark.mode === 'theme'

  if (mark.type === 'svg') {
    return (
      <span
        className="glyph-art"
        // The markup already went through the pipeline sanitiser before reaching here.
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
