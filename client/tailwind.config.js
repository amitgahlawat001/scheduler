/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#6ba7e6',
          DEFAULT: '#4A90D9',
          dark: '#3672ad'
        }
      },
      keyframes: {
        pageIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        cardIn: {
          '0%': { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        progress: {
          '0%': { width: '0%', opacity: 1 },
          '70%': { width: '85%' },
          '100%': { width: '100%', opacity: 0 }
        }
      },
      animation: {
        pageIn: 'pageIn 0.25s ease-out',
        cardIn: 'cardIn 0.35s ease-out',
        progress: 'progress 0.8s ease-in-out forwards'
      }
    }
  },
  plugins: []
};
