# AdBusters 👻

A Halloween-themed Chrome extension ad blocker that captures ads as ghosts!

## Setup

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Create placeholder icons:

```bash
node tools/create-placeholder-icons.cjs
```

3. Build the extension:

```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` directory
   - The AdBusters extension should now appear in your toolbar!

## Development

- `npm run dev` - Build and watch for changes
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run fetch-lists` - Update ad filter lists

## Project Structure

```
adbusters/
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content scripts
│   ├── ui/               # Svelte components
│   ├── assets/           # Icons, sounds, graphics
│   └── rules/            # Ad blocking rules
├── public/               # HTML files and static assets
├── tools/                # Build tools
└── dist/                 # Compiled extension (generated)
```

## Tech Stack

- TypeScript
- Vite
- Svelte
- Tailwind CSS
- Chrome Manifest V3 APIs

## Hackathon Demo

Who ya gonna call... when ads come back from the dead? 🚫👻
