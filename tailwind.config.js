/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        surface: '#1A1A1A',
        surface2: '#222222',
        border: '#2E2E2E',
        'text-primary': '#EFEFEC',
        'text-secondary': '#888480',
        accent: '#4070F4',
        'accent-light': '#1C2952',
        success: '#1EA060',
        warning: '#E8860A',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        base: ['14px', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
