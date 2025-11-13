import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs'

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

      // Generate HTML files
      const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AdBusters</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/popup.js"></script>
</body>
</html>`

      const optionsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AdBusters Settings</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/options.js"></script>
</body>
</html>`

      writeFileSync('dist/popup.html', popupHtml)
      writeFileSync('dist/options.html', optionsHtml)

      // Copy icons if they exist (from public or src/assets/icons)
      const iconFormats = ['png', 'svg']
      const iconSizes = [16, 48, 128]

      iconSizes.forEach((size) => {
        iconFormats.forEach((format) => {
          const icon = `icon${size}.${format}`
          const publicPath = `public/${icon}`
          const assetsPath = `src/assets/icons/${icon}`
          if (existsSync(publicPath)) {
            // Copy to root for manifest
            copyFileSync(publicPath, `dist/${icon}`)
          } else if (existsSync(assetsPath)) {
            copyFileSync(assetsPath, `dist/${icon}`)
          }
        })
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
        popup: resolve(__dirname, 'src/ui/popup.ts'),
        options: resolve(__dirname, 'src/ui/options.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js'
          }
          if (chunkInfo.name === 'popup') {
            return 'popup.js'
          }
          if (chunkInfo.name === 'options') {
            return 'options.js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
