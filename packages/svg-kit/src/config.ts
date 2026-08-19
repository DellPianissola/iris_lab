/**
 * Tuning knobs for the pipeline: values we chose, to be adjusted by eye as real files show
 * up.
 *
 * What does **not** belong here: constants dictated by a specification (`svg-spec.ts`) and
 * security policy (`security.ts`). Pretending those are configurable invites tampering.
 */

export const rasterConfig = {
  /** Below this alpha the pixel is cut-out, not drawing. */
  alphaFloor: 24,
  // Below this share of the area a colour is compression noise or an anti-aliased edge,
  // not part of the drawing. The same floor decides whether the cut-out is meaningful.
  significantArea: 0.02,
  /** Buckets channels into bands of 2^n so compression noise does not become a new colour. */
  channelBucketBits: 5,
  /** Side of the sampled square: the question is "which colours dominate", not the exact drawing. */
  sampleSize: 64,
} as const

export const recolorConfig = {
  /** How many tones the theme drives. The dominant becomes the brand; the second, the accent. */
  toneCount: 2,
  /** Prefix for the injected classes. Unlikely to collide with a design tool's own classes. */
  classPrefix: '__',
} as const

export const cascadeConfig = {
  // Flattening (id, class, type) into one number allows comparing with `>`; the orders of
  // magnitude guarantee no sum of classes ever reaches an id.
  idWeight: 10_000,
  classWeight: 100,
} as const
