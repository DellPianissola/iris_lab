/**
 * Botões de ajuste do pipeline: valores escolhidos por nós, que vão ser mexidos no olho
 * conforme aparecerem arquivos reais.
 *
 * O que **não** entra aqui: constante ditada por especificação (`svg-spec.ts`) e política
 * de segurança (`security.ts`). Fingir que aquilo é configurável convida a mexer.
 */

export const rasterConfig = {
  /** Abaixo deste alfa o pixel é recorte, não desenho. */
  alphaFloor: 24,
  /** Fração da área abaixo da qual uma cor — ou o recorte — não conta. */
  significantArea: 0.02,
  /** Agrupa canais em faixas de 2^n para que ruído de compressão não vire cor nova. */
  channelBucketBits: 5,
  /** Lado do quadrado amostrado: a pergunta é "que cores dominam", não o desenho exato. */
  sampleSize: 64,
} as const

export const recolorConfig = {
  /** Quantos tons o tema controla. O dominante vira a marca; o segundo, o acento. */
  toneCount: 2,
  /** Prefixo das classes injetadas. Improvável colidir com classe de ferramenta de design. */
  classPrefix: '__',
} as const

export const cascadeConfig = {
  /** Pesos da especificidade achatada em número: id > classe > tipo. */
  idWeight: 10_000,
  classWeight: 100,
} as const
