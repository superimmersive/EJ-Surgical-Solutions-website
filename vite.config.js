import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/EJ-Surgical-Solutions-website/' : '/',
  server: {
    port: 5173,
    open: true,
  },
}))
