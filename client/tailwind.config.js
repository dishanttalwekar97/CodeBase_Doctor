/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0A0E14',
          card: '#121721',
          surface: '#161B26',
        },
        indigo: {
          accent: '#6366F1',
          light: '#818CF8',
        },
        cyan: {
          accent: '#22D3EE',
        },
        severity: {
          critical: '#EF4444',
          important: '#F59E0B',
          improvement: '#EAB308',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(99, 102, 241, 0.25)',
        glowCyan: '0 0 20px rgba(34, 211, 238, 0.25)',
      }
    },
  },
  plugins: [],
}
