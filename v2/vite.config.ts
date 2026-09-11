import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:10000'
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
})
