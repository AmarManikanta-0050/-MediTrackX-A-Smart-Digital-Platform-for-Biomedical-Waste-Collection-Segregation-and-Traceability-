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
        /* Legacy navy — kept for compatibility but now maps to light surfaces */
        navy: {
          950: '#f8fffe',
          900: '#f0fdf9',
          850: '#f8fafc',
          800: '#ffffff',
          700: '#f1f5f9',
          600: '#e2e8f0',
        },
        /* New light surface colors */
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f0fdf9',
          hover: '#ecfdf5',
        },
        /* Brand palette */
        brand: {
          emerald: '#059669',
          emeraldLight: '#10b981',
          emeraldDark: '#047857',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          tealDark: '#0f766e',
          blue: '#0369a1',
          blueLight: '#0284c7',
          sky: '#0ea5e9',
          amber: '#d97706',
          rose: '#e11d48',
        },
        /* Extended slate (text colors) */
        slate: {
          850: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(16,185,129,0.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 16px 32px rgba(16,185,129,0.09)',
        'glass': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(16,185,129,0.05)',
        'btn-emerald': '0 4px 14px rgba(5,150,105,0.28)',
        'btn-emerald-hover': '0 6px 18px rgba(5,150,105,0.38)',
        'glow-emerald': '0 0 20px -5px rgba(5,150,105,0.35)',
        'glow-teal': '0 0 20px -5px rgba(13,148,136,0.35)',
        'glow-blue': '0 0 20px -5px rgba(3,105,161,0.3)',
        'inner-emerald': 'inset 0 0 0 2px rgba(5,150,105,0.2)',
        'navbar': '0 1px 8px rgba(0,0,0,0.06)',
        'sidebar': '2px 0 12px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out both',
        'fade-up': 'fadeUp 0.4s ease-out both',
        'fade-down': 'fadeDown 0.3s ease-out both',
        'slide-in-right': 'slideInRight 0.35s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '68': '17rem',
        '72': '18rem',
        '76': '19rem',
        '80': '20rem',
      },
    },
  },
  plugins: [],
}
