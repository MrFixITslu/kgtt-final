import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if running in the AI Studio sandbox environment
const isAiStudio = !!process.env.K_SERVICE;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: isAiStudio ? 3000 : 3070,
    allowedHosts: [
      'kgtt.v79sl.duckdns.org'
    ]
  }
})
