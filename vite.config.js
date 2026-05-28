import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: false,

    // ── Asset handling ──
    assetsInlineLimit: 4096,   // Inline assets < 4KB as base64

    // ── Chunk splitting for optimal caching ──
    rollupOptions: {
      output: {
        // Split vendor chunks — function form required by this Vite version
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('react-hot-toast') || id.includes('qrcode.react') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            return 'vendor-misc';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // ── Minification — Vite 8 uses OXC via rolldown (no separate install needed) ──
    minify: 'oxc',
    target: 'es2020',

    // ── CSS ──
    cssMinify: true,
    cssCodeSplit: true,
  },

  // ── Dev server ──
  server: {
    hmr: true,
  },

  // ── Optimise dependencies pre-bundling ──
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
      'qrcode.react',
    ],
  },
})
