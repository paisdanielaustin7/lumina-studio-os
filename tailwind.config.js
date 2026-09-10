/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0a0a0a',
          surface: '#111111',
          card: '#161616',
          border: '#262626',
          muted: '#808080',
          elevated: '#1c1c1c',
        },
        bone: {
          DEFAULT: '#f9f9f8',
          surface: '#f2f2f0',
          card: '#ffffff',
          border: '#e3e3df',
          muted: '#6e6e73',
          elevated: '#ecece8',
        },
        carbon: {
          DEFAULT: '#0d0d0d',
          light: '#2a2a2a',
        },
        vermillion: {
          DEFAULT: '#eb3829',
          glow: '#ff4d3d',
        },
        editorial: {
          gold: '#c5a059',
          silver: '#a1a1aa',
          sand: '#d7cec7',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Didot', 'Bodoni MT', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'widest-editorial': '0.35em',
        'ultra-wide': '0.5em',
      },
      boxShadow: {
        'brutalist-dark': '4px 4px 0px 0px #262626',
        'brutalist-light': '4px 4px 0px 0px #111111',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
