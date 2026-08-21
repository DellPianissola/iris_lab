/**
 * Tuning knobs for the theme. These are our own choices about appearance — the values get
 * adjusted by eye. What WCAG dictates lives in `contrast.ts`; what is content lives in
 * `data/`.
 */

/**
 * Recipe for the neutrals from the brand's hue. Keeping the hue and moving only saturation
 * and lightness is what makes a palette look intentional rather than drawn from a hat.
 */
export const neutralRecipes = {
  light: {
    bg: { saturation: 0.3, lightness: 0.99 },
    surface: { saturation: 0.22, lightness: 0.96 },
    text: { saturation: 0.25, lightness: 0.1 },
    muted: { saturation: 0.1, lightness: 0.45 },
    line: { saturation: 0.18, lightness: 0.9 },
  },
  dark: {
    bg: { saturation: 0.14, lightness: 0.07 },
    surface: { saturation: 0.13, lightness: 0.12 },
    text: { saturation: 0.12, lightness: 0.94 },
    muted: { saturation: 0.09, lightness: 0.66 },
    line: { saturation: 0.12, lightness: 0.2 },
  },
} as const

/**
 * How far each of the tool's own surfaces sits from the customer's background, mixing toward
 * white on a dark palette and toward black on a light one.
 *
 * `panel` is deliberately level with the background on light palettes: a lifted panel there
 * reads as grey scum over a white page, and the island already separates itself with a shadow
 * and a line. The ladder exists so `panel2` always has somewhere to be.
 */
export const chromeMix = {
  light: { bg: 0.04, panel: 0.0, panel2: 0.05, line: 0.12, hover: 0.3 },
  dark: { bg: 0.02, panel: 0.06, panel2: 0.11, line: 0.16, hover: 0.32 },
} as const

/**
 * The hue is fixed because it carries the meaning — green passes, amber is conditional, red
 * fails — and meaning must not move with the customer's brand.
 */
export const gradeHues = { pass: '#16a34a', large: '#d97706', fail: '#dc2626' } as const

/**
 * Everything else about a grade pill is derived from the surface it lands on: a pill drawn for
 * a dark chrome is a dark blob on a light one. This is how much hue goes into that surface.
 */
export const gradeTint = { light: 0.16, dark: 0.24 } as const

/** How much brand goes into the background to form the soft pill/icon surface. */
export const softMix = { light: 0.13, dark: 0.22 } as const

/** A first nudge before the contrast search, so it does not start from scratch. */
export const inkMix = { light: 0.12, dark: 0.35 } as const

// A small step finds the nearest tone that still passes instead of overshooting; the cap
// exists because a mid-luminance background may have no solution at all.
export const contrastSearch = { lightnessStep: 0.02, maxSteps: 60 } as const

export const accentHarmony = {
  /** Rotation on the colour wheel — near the complement, without landing on it. */
  rotationDeg: 165,
  jitterDeg: 15,
  minSaturation: 0.55,
  maxSaturation: 0.92,
  saturationBoost: 0.12,
  lightness: { light: 0.52, dark: 0.62 },
} as const

export const randomRanges = {
  saturation: { min: 0.45, spread: 0.45 },
  lightness: { light: { min: 0.36, spread: 0.2 }, dark: { min: 0.52, spread: 0.14 } },
  accentRotation: { analogous: { min: 30, spread: 25 }, complementary: { min: 150, spread: 60 } },
} as const

export const darkBackgroundThreshold = 0.35
