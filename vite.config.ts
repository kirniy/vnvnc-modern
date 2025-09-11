import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Better chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion'],
          'ui-vendor': ['lucide-react', 'react-icons'],
          'query': ['@tanstack/react-query', 'axios'],
          // Three.js is heavy, split it out
          'three': ['three', '@react-three/fiber', '@react-three/postprocessing', 'postprocessing'],
        },
        // Better chunk naming with timestamp for cache busting
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
          return `assets/js/${facadeModuleId}-[hash].js`
        },
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Force new entry file name with timestamp
        entryFileNames: `assets/[name]-${Date.now()}.js`,
      },
    },
    // Optimize for production
    minify: 'terser',
    // Set chunk size warnings
    chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1MB
    // Enable source maps for production debugging
    sourcemap: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Better CSS handling
    cssCodeSplit: true,
    cssMinify: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
    ],
    exclude: ['@react-three/fiber'], // Three.js needs special handling
  },
  // Server configuration for development
  server: {
    port: 5173,
    cors: true,
    // Preload critical modules
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/HomePage.tsx',
      ],
    },
  },
})
