import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // lock the dev server port so it doesn't shift when the previous instance
    // is still running or another process is using 5173.
    port: 5176,

    // If you consume a backend, proxy requests instead of hardcoding the
    // address everywhere.  This also removes CORS headaches.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },

  plugins: [react()],
})
