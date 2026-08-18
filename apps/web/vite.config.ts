import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Porta padrão do Vite: o produto é o que sobe quando alguém roda `pnpm dev`.
  server: { port: 5173, strictPort: true },
})
