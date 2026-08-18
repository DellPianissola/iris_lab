import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // Node puro: este pacote não pode precisar de DOM para ser testado.
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
