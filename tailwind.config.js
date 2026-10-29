/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#07060c', 900: '#0c0a14', 800: '#141120', 700: '#1d1930', 600: '#2a2542', 500: '#3a3358' },
        gold: { 200: '#f4e3a8', 300: '#ecd07a', 400: '#e0b94f', 500: '#d4a634', 600: '#b0862a' },
        crimson: { 400: '#e0525c', 500: '#c1272d', 600: '#9b1c24', 700: '#741319' },
        parchment: { 50: '#fbf6ea', 100: '#efe3c8', 200: '#dccaa0' },
        muted: '#a9a2bb',
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        flicker: {
          '0%,100%': { transform: 'scale(1) translateX(0)', opacity: '1' },
          '25%': { transform: 'scale(0.92, 1.08) translateX(0.5px)', opacity: '0.92' },
          '50%': { transform: 'scale(1.06, 0.95) translateX(-0.5px)', opacity: '1' },
          '75%': { transform: 'scale(0.96, 1.05) translateX(0.5px)', opacity: '0.9' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        'spin-reverse': { to: { transform: 'rotate(-360deg)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-glow': { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        flutter: { '0%,100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(0.55)' } },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        flicker: 'flicker 2.4s ease-in-out infinite',
        'spin-slow': 'spin 80s linear infinite',
        'spin-slower': 'spin 40s linear infinite',
        'spin-reverse': 'spin-reverse 120s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-glow': 'pulse-glow 3.5s ease-in-out infinite',
        flutter: 'flutter 0.35s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(212 166 52 / 0.45)',
        'glow-sm': '0 0 18px -4px rgb(212 166 52 / 0.5)',
      },
    },
  },
  plugins: [],
};
