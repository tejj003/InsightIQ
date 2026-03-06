import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use relative paths for production (GitHub Pages), absolute for dev server
  base: mode === 'production' ? './' : '/',
}))
