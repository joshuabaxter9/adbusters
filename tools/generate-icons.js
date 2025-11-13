// Simple script to generate placeholder icons
// For a real project, use proper image assets

const fs = require('fs')
const path = require('path')

// Create a simple SVG icon and save as placeholder
const sizes = [16, 48, 128]

const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1a1a1a"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" fill="#39FF14" text-anchor="middle" dominant-baseline="middle">👻</text>
</svg>
`

sizes.forEach(size => {
  const svg = createSVG(size)
  const filename = path.join(__dirname, '..', 'public', `icon${size}.svg`)
  fs.writeFileSync(filename, svg.trim())
  console.log(`Created icon${size}.svg`)
})

console.log('\nNote: These are placeholder SVG icons.')
console.log('For production, replace with proper PNG icons in public/ directory.')
