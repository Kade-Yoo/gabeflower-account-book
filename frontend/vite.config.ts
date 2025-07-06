import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole(),
  ],
  server: {
    proxy: {
      '/menu': 'http://localhost:8000',
      '/entry': 'http://localhost:8000',
      '/ledger': 'http://localhost:8000',
      '/user': 'http://localhost:8000',
    }
  }
})
