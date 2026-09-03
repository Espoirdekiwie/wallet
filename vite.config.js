import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/ethers')) {
            return 'ethers'
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/react-icons')) {
            return 'ui-vendors'
          }
        }
      }
    }
  }
})
