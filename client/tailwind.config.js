/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#070E1A',
          850: '#0B1528',
          800: '#0F1E36',
          700: '#172C4C',
          600: '#213E66',
        },
        slate: {
          850: '#151F32',
          900: '#0F172A',
          950: '#0A0F1D',
        },
        brand: {
          teal: '#0D9488',
          tealLight: '#14B8A6',
          tealDark: '#0F766E',
          blue: '#1E40AF',
          blueLight: '#3B82F6',
          sky: '#0284C7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        },
        card: {
          bg: 'rgba(15, 27, 49, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(23, 44, 76, 0.85)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-teal': '0 0 20px -5px rgba(13, 148, 136, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
