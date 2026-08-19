import type { CSSProperties } from 'react'
import type { Mark } from '../../marks/types'
import { WORDMARK_SPLIT } from '../../state/config'
import { Glyph } from './Glyph'

interface LockupProps {
  readonly mark: Mark | undefined
  readonly wordmark: string
  readonly markSize: number
  readonly wordSize: number
  /** Forces the text colour — used on the grounds where the text token does not apply. */
  readonly textColor?: string
}

export function Lockup({ mark, wordmark, markSize, wordSize, textColor }: LockupProps) {
  const style = {
    '--mark-size': `${markSize}px`,
    '--word-size': `${wordSize}px`,
    ...(textColor ? { color: textColor } : {}),
  } as CSSProperties

  const [head, ...rest] = wordmark.split(WORDMARK_SPLIT)
  const tail = rest.join(WORDMARK_SPLIT)

  return (
    <span className="lockup" style={style}>
      <span className="glyph">
        <Glyph mark={mark} />
      </span>
      {wordmark && (
        <span className="word">
          {head}
          {tail && <em style={textColor ? { color: 'inherit', opacity: 0.72 } : undefined}>{tail}</em>}
        </span>
      )}
    </span>
  )
}
