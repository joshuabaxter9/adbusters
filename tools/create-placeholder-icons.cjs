// Create simple placeholder icons for testing
const fs = require('fs')
const path = require('path')

// Create a minimal 1x1 transparent PNG (base64 encoded)
// This is a valid PNG file that Chrome will accept
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

const sizes = [16, 48, 128]
const publicDir = path.join(__dirname, '..', 'public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

sizes.forEach((size) => {
  const filename = path.join(publicDir, `icon${size}.png`)
  fs.writeFileSync(filename, transparentPNG)
  console.log(`Created placeholder icon${size}.png`)
})

console.log('\n✓ Placeholder icons created successfully')
console.log('Note: Replace these with proper icons in task 8')
