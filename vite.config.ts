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
          terms_ja: 'src/pages/terms_ja.html',
          terms_en: 'src/pages/terms_en.html',
          terms_zh: 'src/pages/terms_zh.html',
          privacy_ja: 'src/pages/privacy_ja.html',
          privacy_en: 'src/pages/privacy_en.html',
          privacy_zh: 'src/pages/privacy_zh.html',
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
