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
      '/menu': 'https://gabeflower-account-book.fly.dev',
      '/entry': 'https://gabeflower-account-book.fly.dev',
      '/ledger': 'https://gabeflower-account-book.fly.dev',
      '/user': 'https://gabeflower-account-book.fly.dev',
    }
  }
})
