import artwork from '../assets/brand/nomai-eye.svg?raw'

/**
 * The company mark. It is a **copy** of the eye in `assets/marks/` rather than an import of
 * it: that folder is the corpus the customer tests symbols against, and the day someone swaps
 * a fixture our own logo must not change with it. The two are identical today by intent, not
 * by coupling.
 *
 * Injected rather than served as an `<img>` so the paths keep `currentColor` and the mark
 * follows whatever colour the surface around it is using.
 */
export function NomaiMark({ className }: { readonly className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      // Our own file, checked into the repository — not customer input.
      dangerouslySetInnerHTML={{ __html: artwork }}
    />
  )
}

interface NomaiLockupProps {
  /** The product line under the company name, where the lockup has room for it. */
  readonly withProduct?: boolean
}

/**
 * The wordmark, drawn rather than written: the split before `Code` is what carries the accent,
 * and the name is set without the space the prose form has. Neither can be derived from
 * `app.company`, which is why this is markup and not a dictionary string — and why it lives in
 * one place instead of being retyped wherever the brand appears.
 *
 * The spoken form stays `app.fullName`, on whatever control this sits inside.
 */
export function NomaiLockup({ withProduct = false }: NomaiLockupProps) {
  return (
    <span className="nomai-lockup" aria-hidden="true">
      <strong>
        Nomai<em>Code</em>
      </strong>
      {withProduct && <small>Íris</small>}
    </span>
  )
}
