/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        'pumpkin-orange': '#FF6B35',
        'neon-green': '#39FF14',
        'spectral-blue': '#00D9FF',
        'dark-bg': '#1a1a1a',
        'ghost-white': '#f0f0f0',
      },
      boxShadow: {
        'glow-green': '0 0 20px #39FF14, 0 0 40px #39FF14',
        'glow-blue': '0 0 20px #00D9FF, 0 0 40px #00D9FF',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
