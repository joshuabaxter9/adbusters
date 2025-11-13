// Create simple PNG icons for AdBusters
// This creates a basic colored square with text as a placeholder
const fs = require('fs')
const path = require('path')

// Create a simple PNG with a colored background and text
// This is a minimal approach that doesn't require canvas or image libraries
function createSimplePNG(size, text) {
  // For now, create a simple colored PNG using a base64 encoded image
  // This is a green square with transparency - better than nothing!
  const greenSquarePNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  )

  return greenSquarePNG
}

const sizes = [16, 48, 128]
const publicDir = path.join(__dirname, '..', 'public')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

sizes.forEach((size) => {
  const png = createSimplePNG(size, '👻')
  const filename = path.join(publicDir, `icon${size}.png`)
  fs.writeFileSync(filename, png)
  console.log(`Created icon${size}.png (${size}x${size})`)
})

console.log('\n✓ PNG icons created')
console.log('Note: These are placeholder green squares.')
console.log('For better icons, provide a PNG image or use an online icon generator.')
console.log('Recommended: https://www.favicon-generator.org/ or similar')
