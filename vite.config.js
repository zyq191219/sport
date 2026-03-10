import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://mg.aid.pub',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-proxy/, '')
      }
    }
  }
})
