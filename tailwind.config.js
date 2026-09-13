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
      screens: {
        xs: '380px',
      },
      colors: {
        obsidian: {
          DEFAULT: 'var(--obsidian-default, #0b0d0e)',
          surface: 'var(--obsidian-surface, #131618)',
          card: 'var(--obsidian-card, #181c1f)',
          border: 'var(--obsidian-border, #282e34)',
          muted: 'var(--obsidian-muted, #86919a)',
          elevated: 'var(--obsidian-elevated, #1c2227)',
        },
        bone: {
          DEFAULT: 'var(--bone-default, #fbfbfa)',
          surface: 'var(--bone-surface, #f4f3ef)',
          card: 'var(--bone-card, #ffffff)',
          border: 'var(--bone-border, #e2e0d8)',
          muted: 'var(--bone-muted, #686763)',
          elevated: 'var(--bone-elevated, #eceae3)',
        },
        carbon: {
          DEFAULT: '#0d0d0d',
          light: '#2a2a2a',
        },
        vermillion: {
          DEFAULT: 'rgb(var(--theme-accent-rgb, 235 56 41) / <alpha-value>)',
          glow: 'rgb(var(--theme-accent-glow-rgb, 255 77 61) / <alpha-value>)',
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
