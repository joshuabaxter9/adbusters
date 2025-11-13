// Create proper ghost-themed icons for AdBusters
const fs = require('fs')
const path = require('path')

// SVG ghost icon template
function createGhostIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="100" height="100" fill="#1a1a1a" rx="15"/>
  
  <!-- Ghost body -->
  <path d="M50 25 C35 25 25 35 25 50 L25 75 L32 68 L40 75 L50 68 L60 75 L68 68 L75 75 L75 50 C75 35 65 25 50 25 Z" 
        fill="#f0f0f0" 
        stroke="#39FF14" 
        stroke-width="2"/>
  
  <!-- Eyes -->
  <circle cx="42" cy="45" r="4" fill="#1a1a1a"/>
  <circle cx="58" cy="45" r="4" fill="#1a1a1a"/>
  
  <!-- Glow effect -->
  <circle cx="50" cy="50" r="35" fill="none" stroke="#39FF14" stroke-width="1" opacity="0.3"/>
</svg>`
}

const sizes = [16, 48, 128]
const publicDir = path.join(__dirname, '..', 'public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

sizes.forEach((size) => {
  const svg = createGhostIconSVG(size)
  const filename = path.join(publicDir, `icon${size}.svg`)
  fs.writeFileSync(filename, svg)
  console.log(`Created ghost icon${size}.svg`)
})

console.log('\n✓ Ghost icons created successfully')
console.log('Note: Chrome extensions prefer PNG, but SVG works for development')
console.log('For production, convert these to PNG using an image editor')
