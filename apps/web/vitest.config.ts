import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // A lógica testada aqui é pura: seleção e derivação, sem componente.
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
