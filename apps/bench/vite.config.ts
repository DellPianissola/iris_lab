import { defineConfig } from 'vite'

export default defineConfig({
  // Longe da porta padrão: a bancada é ferramenta de dev e não pode ser confundida com o
  // produto por quem só abriu localhost:5173.
  server: {
    port: 5199,
    strictPort: true,
    // Os fixtures moram em packages/svg-kit/fixtures, fora da pasta do app.
    fs: { allow: ['../..'] },
  },
})
