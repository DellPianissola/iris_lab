import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Most of what is tested here is pure — selection, derivation, encoding. The files that
    // need a document ask for one with a `@vitest-environment` docblock.
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
  },
})
