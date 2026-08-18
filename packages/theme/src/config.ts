/**
 * Botões de ajuste do tema. São escolhas nossas de aparência — os valores vão ser mexidos
 * no olho. O que é ditado pelo WCAG mora em `contrast.ts`; o que é conteúdo mora em
 * `data/`.
 */

/**
 * Receita dos neutros a partir do matiz da marca. Preservar o matiz e mexer só em
 * saturação/luminosidade é o que faz a paleta parecer intencional em vez de sorteada.
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

/** Quanto da marca entra no fundo para formar a pílula/ícone suave. */
export const softMix = { light: 0.13, dark: 0.22 } as const

/** Ajuste inicial da marca antes da busca por contraste, para não começar do zero. */
export const inkMix = { light: 0.12, dark: 0.35 } as const

/** Busca da versão legível de uma cor: passo de luminosidade e teto de iterações. */
export const contrastSearch = { lightnessStep: 0.02, maxSteps: 60 } as const

/** Geração do acento a partir da marca. */
export const accentHarmony = {
  /** Giro no círculo cromático — perto do complementar, sem cair nele. */
  rotationDeg: 165,
  jitterDeg: 15,
  minSaturation: 0.55,
  maxSaturation: 0.92,
  saturationBoost: 0.12,
  lightness: { light: 0.52, dark: 0.62 },
} as const

/** Sorteio de paleta. */
export const randomRanges = {
  saturation: { min: 0.45, spread: 0.45 },
  lightness: { light: { min: 0.36, spread: 0.2 }, dark: { min: 0.52, spread: 0.14 } },
  accentRotation: { analogous: { min: 30, spread: 25 }, complementary: { min: 150, spread: 60 } },
} as const

/** Abaixo desta luminância relativa o fundo conta como escuro. */
export const darkBackgroundThreshold = 0.35
