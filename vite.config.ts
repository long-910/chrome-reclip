import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        input: {
          popup: 'src/popup/index.html',
          settings: 'src/popup/settings.html',
          saved: 'src/pages/saved.html',
          content: 'src/content/index.ts',
          background: 'src/background/index.ts'
        },
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },

    plugins: [
      crx({ manifest }),
    ],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
