import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', 'zustand'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'vendor': ['react', 'react-dom'],
          'three': ['three', '@react-three/fiber'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
