import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const KB = 1024
const APP_CHUNK_BUDGET_KB = 450
const DEFERRED_DNA_CHUNK_BUDGET_KB = 525

function qvanixBundleBudget(): Plugin {
  return {
    name: 'qvanix-bundle-budget',
    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') continue
        const bytes = new TextEncoder().encode(output.code).length
        const isDeferredDna = fileName.includes('pixi-dna-')
        const budgetKb = isDeferredDna ? DEFERRED_DNA_CHUNK_BUDGET_KB : APP_CHUNK_BUDGET_KB
        if (bytes > budgetKb * KB) {
          this.error(
            `${fileName} is ${(bytes / KB).toFixed(1)} KiB; QVANIX budget is ${budgetKb} KiB${isDeferredDna ? ' for the deferred DNA/Pixi chunk' : ' for non-DNA chunks'}.`,
          )
        }
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), qvanixBundleBudget()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:10000'
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    // Pixi is imported dynamically by WorldStage and is intentionally outside
    // the first-load portfolio/analytics path. Vite's single global warning
    // cannot express that distinction, so the plugin above enforces stricter
    // per-chunk budgets while this limit suppresses the generic Pixi warning.
    chunkSizeWarningLimit: DEFERRED_DNA_CHUNK_BUDGET_KB,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/pixi.js/')) return 'pixi-dna'
        },
      },
    },
  }
})
