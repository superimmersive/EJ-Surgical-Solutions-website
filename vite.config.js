import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/EJ-Surgical-Solutions-website/' : '/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: '/',
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
}))
