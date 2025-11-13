import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy manifest and static assets
function copyAssets() {
  return {
    name: 'copy-assets',
    closeBundle() {
      // Ensure assets directory exists
      if (!existsSync('dist/assets')) {
        mkdirSync('dist/assets', { recursive: true })
      }

      // Copy manifest.json
      copyFileSync('manifest.json', 'dist/manifest.json')

      // Copy icons if they exist (from public or src/assets/icons)
      const icons = ['icon16.png', 'icon48.png', 'icon128.png']
      icons.forEach((icon) => {
        const publicPath = `public/${icon}`
        const assetsPath = `src/assets/icons/${icon}`
        if (existsSync(publicPath)) {
          copyFileSync(publicPath, `dist/assets/${icon}`)
        } else if (existsSync(assetsPath)) {
          copyFileSync(assetsPath, `dist/assets/${icon}`)
        }
      })

      // Copy rules
      if (!existsSync('dist/rules')) {
        mkdirSync('dist/rules', { recursive: true })
      }
      if (existsSync('src/rules/baseRules.json')) {
        copyFileSync('src/rules/baseRules.json', 'dist/rules/baseRules.json')
      }
      if (existsSync('src/rules/aggressiveRules.json')) {
        copyFileSync('src/rules/aggressiveRules.json', 'dist/rules/aggressiveRules.json')
      }

      // Copy sounds if they exist
      if (existsSync('src/assets/sounds')) {
        const soundFiles = ['trap.mp3', 'trap.ogg']
        soundFiles.forEach((sound) => {
          const soundPath = `src/assets/sounds/${sound}`
          if (existsSync(soundPath)) {
            copyFileSync(soundPath, `dist/assets/${sound}`)
          }
        })
      }

      console.log('✓ Copied manifest and assets to dist/')
    },
  }
}

export default defineConfig({
  plugins: [svelte(), copyAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content-script': resolve(__dirname, 'src/content/content-script.ts'),
        popup: resolve(__dirname, 'public/popup.html'),
        options: resolve(__dirname, 'public/options.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep HTML files at root
          if (assetInfo.name?.endsWith('.html')) {
            return '[name][extname]'
          }
          // Keep CSS in assets
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
