import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // O pipeline precisa de DOMParser/XMLSerializer reais. happy-dom entrega os dois em
    // Node; o parser continua entrando por injeção (SvgDom), então nada aqui vaza pro src.
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
  },
})
