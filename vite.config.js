import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // This will expose the server to your network
  },
  css: {
    devSourcemap: true,
  },
})